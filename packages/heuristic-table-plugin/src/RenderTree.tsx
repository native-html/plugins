import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TNodeRenderer } from 'react-native-render-html';
import { HeuristicTablePluginConfig, RenderNode } from './shared-types';

const styles = StyleSheet.create({
  colContainer: { flexDirection: 'column', flexGrow: 1 },
  rowContainer: { flexDirection: 'row', flexGrow: 1 }
});

export default function RenderTree({
  node,
  config
}: {
  node: RenderNode;
  config?: HeuristicTablePluginConfig;
}) {
  if (node.type === 'cell') {
    const { width } = node;
    const style = { width, flexGrow: 1 };
    return (
      <View style={style}>
        <TNodeRenderer
          propsFromParent={{ cell: node, collapsedMarginTop: null, config }}
          parentMarkers={{} as any}
          tnode={node.tnode}
        />
      </View>
    );
  }
  if (node.type === 'root' || node.type === 'col-container') {
    const children = (node.children as RenderNode[]).map((v, i) =>
      React.createElement(RenderTree, { node: v, key: i, config })
    );
    return <View style={styles.colContainer}>{children}</View>;
  }
  if (node.type === 'row-container') {
    return (
      <View style={styles.rowContainer}>
        {node.children.map((v, i) =>
          React.createElement(RenderTree, { node: v, key: i, config })
        )}
      </View>
    );
  }
  return null;
}
