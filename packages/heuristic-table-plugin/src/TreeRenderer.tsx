import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TNodeRenderer } from '@native-html/render';
import {
  InternalTableCellPropsFromParent,
  TableRenderNode
} from './shared-types';
import CellContentWidthContext from './CellContentWidthContext';
import TableRenderContext from './TableRenderContext';
import { getHorizontalInsets } from './helpers/measure';

const styles = StyleSheet.create({
  colContainer: { flexDirection: 'column', flexGrow: 1 },
  rowContainer: { flexDirection: 'row', flexGrow: 1 }
});

export interface TreeRendererProps {
  node: TableRenderNode;
  renderIndex: number;
  renderLength: number;
}

/**
 * The height a row container owes to the `height` its source `tr` declared.
 *
 * @remarks
 * The render tree replaces source rows with flex containers, so their height
 * floor has to be recovered here; a row must still grow when its content is
 * taller. A spanning cell does not impose its starting row's height on its
 * whole synthetic row group.
 */
function getRowMinHeight(children: readonly TableRenderNode[]): number {
  return children.reduce((height, child) => {
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
}

export default function TreeRenderer({
  node,
  renderIndex,
  renderLength
}: TreeRendererProps) {
  const {
    borderSpacing,
    cellStyles,
    borderCollapse,
    tableBorderStyle,
    maxX,
    maxY,
    config
  } = useContext(TableRenderContext);
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
    const propsFromParent: InternalTableCellPropsFromParent = {
      cell: node,
      collapsedMarginTop: null,
      config,
      resolvedCellStyle: cellStyles.get(node.tnode),
      borderCollapse,
      tableBorderStyle,
      maxX,
      maxY
    };
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
            propsFromParent={propsFromParent}
            tnode={node.tnode}
          />
        </CellContentWidthContext.Provider>
      </View>
    );
  }
  if (node.type === 'root' || node.type === 'col-container') {
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
        <TreeRendererChildren children={node.children} />
      </View>
    );
  }
  if (node.type === 'row-container') {
    const minHeight = getRowMinHeight(node.children);
    return (
      <View style={[styles.rowContainer, minHeight > 0 && { minHeight }]}>
        <TreeRendererChildren children={node.children} />
      </View>
    );
  }
  return null;
}

/** Render every child of a container, each told where it sits among them. */
function TreeRendererChildren({
  children
}: {
  children: readonly TableRenderNode[];
}) {
  return (
    <>
      {children.map((child, index) => (
        <TreeRenderer
          key={index}
          node={child}
          renderIndex={index}
          renderLength={children.length}
        />
      ))}
    </>
  );
}
