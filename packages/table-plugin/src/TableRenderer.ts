import React from 'react';
import {
  CustomBlockRenderer,
  defaultHTMLElementModels,
  HTMLContentModel
} from 'react-native-render-html';
import { HTMLElementModel } from '@native-html/transient-render-engine';
import useHtmlTableProps from './useHtmlTableProps';
import { HTMLTable } from './HTMLTable';

/**
 * The renderer component for the table element. This renderer is fully
 * scalable, and will adjust to `contentWidth` and `computeEmbeddedMaxWidth`.
 * It also features `onLinkPress`.
 *
 * @public
 */
const TableRenderer: CustomBlockRenderer = function TableRenderer(props) {
  const tableProps = useHtmlTableProps(props);
  return tableProps ? React.createElement(HTMLTable, tableProps) : null;
};

/**
 * The model to attach to custom table renderers.
 *
 * @public
 */
export const tableModel: HTMLElementModel<
  'table',
  HTMLContentModel.block
> = defaultHTMLElementModels.table.extend({
  contentModel: HTMLContentModel.block,
  isOpaque: true
});

export default TableRenderer;
