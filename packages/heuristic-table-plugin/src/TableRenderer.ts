import React from 'react';
import { CustomBlockRenderer } from '@native-html/render';
import HTMLTable from './HTMLTable';
import useHtmlTableProps from './useHtmlTableProps';

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
