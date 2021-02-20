import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import thModel from './models/thModel';
import { TableCellPropsFromParent } from './shared-types';
import useHtmlTableCellProps from './useHtmlTableCellProps';

/**
 * The renderer component for `th` tag.
 *
 * @param props - Component props.
 * @public
 */
const ThRenderer: CustomBlockRenderer<TableCellPropsFromParent> = function (
  props
) {
  return React.createElement(
    props.TDefaultRenderer,
    useHtmlTableCellProps(props)
  );
};

ThRenderer.model = thModel;

export default ThRenderer;
