import React, { useMemo } from 'react';
import { BorderSpacing } from './helpers/resolveBorderSpacing';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TNode, TNodeRenderer } from '@native-html/render';
import { ResolvedCellStyle } from './helpers/resolveTableStyles';
import { HeuristicTablePluginConfig, TableRenderNode } from './shared-types';
import CellContentWidthContext from './CellContentWidthContext';
import { getHorizontalInsets } from './helpers/measure';

const styles = StyleSheet.create({
  colContainer: { flexDirection: 'column', flexGrow: 1 },
  rowContainer: { flexDirection: 'row', flexGrow: 1 }
});

export default function TreeRenderer({
  node,
  borderSpacing = { horizontal: 0, vertical: 0 },
  config,
  cellStyles,
  borderCollapse,
  tableBorderStyle,
  maxX,
  maxY,
  renderIndex,
  renderLength
}: {
  node: TableRenderNode;
  borderSpacing?: BorderSpacing;
  renderIndex: number;
  renderLength: number;
  config?: HeuristicTablePluginConfig;
  cellStyles: ReadonlyMap<TNode, ResolvedCellStyle>;
  borderCollapse: boolean;
  tableBorderStyle: ViewStyle | null;
  maxX: number;
  maxY: number;
}) {
  const cellContentBox = useMemo(
    () =>
      node.type === 'cell'
        ? {
            tnode: node.tnode,
            contentWidth: Math.max(
              0,
              node.width -
                getHorizontalInsets(cellStyles.get(node.tnode)!.style)
            )
          }
        : undefined,
    [node, cellStyles]
  );
  if (node.type === 'cell') {
    return (
      <View
        style={{
          width: node.width,
          marginEnd: node.x + node.lenX <= maxX ? borderSpacing.horizontal : 0,
          marginBottom: node.y + node.lenY <= maxY ? borderSpacing.vertical : 0
        }}
      >
        <CellContentWidthContext.Provider value={cellContentBox}>
          <TNodeRenderer
            renderIndex={renderIndex}
            renderLength={renderLength}
            propsFromParent={
              {
                cell: node,
                collapsedMarginTop: null,
                config,
                resolvedCellStyle: cellStyles.get(node.tnode),
                borderCollapse,
                tableBorderStyle,
                maxX,
                maxY
              } as any
            }
            tnode={node.tnode}
          />
        </CellContentWidthContext.Provider>
      </View>
    );
  }
  if (node.type === 'root' || node.type === 'col-container') {
    const children = (node.children as TableRenderNode[]).map((v, i) =>
      React.createElement(TreeRenderer, {
        node: v,
        key: i,
        config,
        borderSpacing,
        cellStyles,
        borderCollapse,
        tableBorderStyle,
        maxX,
        maxY,
        renderIndex: i,
        renderLength: node.children.length
      })
    );
    return (
      <View
        style={[
          styles.colContainer,
          node.type === 'root' &&
            node.children.length > 0 && {
              paddingHorizontal: borderSpacing.horizontal,
              paddingVertical: borderSpacing.vertical
            }
        ]}
      >
        {children}
      </View>
    );
  }
  if (node.type === 'row-container') {
    // The render tree replaces source rows with flex containers. Preserve
    // their height floor here; a row must still grow when its content is taller.
    // A spanning cell does not impose its starting row's height on its whole
    // synthetic row group.
    const minHeight = node.children.reduce((height, child) => {
      if (child.type !== 'cell' || child.lenY !== 1) return height;
      const row = child.tnode.parent;
      if (row?.tagName !== 'tr') return height;
      const style = row.styles.nativeBlockRet;
      return Math.max(
        height,
        typeof style.height === 'number' ? style.height : 0,
        typeof style.minHeight === 'number' ? style.minHeight : 0
      );
    }, 0);
    return (
      <View style={[styles.rowContainer, minHeight > 0 && { minHeight }]}>
        {node.children.map((v, i) =>
          React.createElement(TreeRenderer, {
            node: v,
            key: i,
            config,
            borderSpacing,
            cellStyles,
            borderCollapse,
            tableBorderStyle,
            maxX,
            maxY,
            renderIndex: i,
            renderLength: node.children.length
          })
        )}
      </View>
    );
  }
  return null;
}
