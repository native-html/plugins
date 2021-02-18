import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import {
  CustomBlockRenderer,
  defaultHTMLElementModels,
  TNode
} from 'react-native-render-html';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay
} from './helpers/fillTableDisplay';
import RenderTree from './RenderTree';
import { HeuristicTablePluginConfig } from './shared-types';

function useRenderTree({
  tnode,
  contentWidth
}: {
  tnode: TNode;
  contentWidth: number;
}) {
  return useMemo(() => {
    const display = createEmptyDisplay();
    fillTableDisplay(tnode, display);
    const columnWidths = computeColumnWidths(display, contentWidth);
    return createRenderTree(display, columnWidths);
  }, [tnode, contentWidth]);
}

declare module 'react-native-render-html' {
  // eslint-disable-next-line no-shadow
  interface RenderersPropsBase {
    table?: HeuristicTablePluginConfig;
  }
}

/**
 * The renderer component for `table` tag.
 *
 * @param props - Component props.
 * @public
 */
const RenderTable: CustomBlockRenderer = function ({
  TDefaultRenderer,
  ...props
}) {
  const {
    contentWidth,
    renderersProps: { table }
  } = props.sharedProps;
  const tree = useRenderTree({ tnode: props.tnode, contentWidth });
  return (
    <TDefaultRenderer {...props}>
      <ScrollView horizontal style={{ width: contentWidth }}>
        {React.createElement(RenderTree, { node: tree, config: table })}
      </ScrollView>
    </TDefaultRenderer>
  );
};

RenderTable.model = defaultHTMLElementModels.table;

export default RenderTable;
