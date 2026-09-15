import React, { useMemo } from 'react';
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
      <View style={{ width: node.width }}>
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
        cellStyles,
        borderCollapse,
        tableBorderStyle,
        maxX,
        maxY,
        renderIndex: i,
        renderLength: node.children.length
      })
    );
    return <View style={styles.colContainer}>{children}</View>;
  }
  if (node.type === 'row-container') {
    return (
      <View style={styles.rowContainer}>
        {node.children.map((v, i) =>
          React.createElement(TreeRenderer, {
            node: v,
            key: i,
            config,
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
