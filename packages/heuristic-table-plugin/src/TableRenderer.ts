import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import HTMLTable from './HTMLTable';
import { HeuristicTablePluginConfig } from './shared-types';
import useHtmlTableProps from './useHtmlTableProps';

declare module 'react-native-render-html' {
  interface RenderersPropsBase {
    table?: HeuristicTablePluginConfig;
  }
}

/**
 * A 100% native renderer component for `table` tag.
 *
 * @param props - Component props.
 * @public
 */
const TableRenderer: CustomBlockRenderer = function (props) {
  return React.createElement(HTMLTable, useHtmlTableProps(props));
};

export default TableRenderer;
