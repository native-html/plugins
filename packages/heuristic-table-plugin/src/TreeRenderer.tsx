import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TNodeRenderer } from 'react-native-render-html';
import { HeuristicTablePluginConfig, TableRenderNode } from './shared-types';

const styles = StyleSheet.create({
  colContainer: { flexDirection: 'column', flexGrow: 1 },
  rowContainer: { flexDirection: 'row', flexGrow: 1 }
});

export default function TreeRenderer({
  node,
  config
}: {
  node: TableRenderNode;
  config?: HeuristicTablePluginConfig;
}) {
  if (node.type === 'cell') {
    return (
      <View style={{ width: node.width }}>
        <TNodeRenderer
          propsFromParent={
            { cell: node, collapsedMarginTop: null, config } as any
          }
          tnode={node.tnode}
        />
      </View>
    );
  }
  if (node.type === 'root' || node.type === 'col-container') {
    const children = (node.children as TableRenderNode[]).map((v, i) =>
      React.createElement(TreeRenderer, {
        node: v,
        key: i,
        config
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
            config
          })
        )}
      </View>
    );
  }
  return null;
}
