import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import tdModel from './models/tdModel';
import { TableCellPropsFromParent } from './shared-types';
import useHtmlTableCellProps from './useHtmlTableCellProps';

/**
 * The renderer component for `td` tag.
 *
 * @param props - Component props.
 * @public
 */
const TdRenderer: CustomBlockRenderer<TableCellPropsFromParent> = function (props) {
  return React.createElement(
    props.TDefaultRenderer,
    useHtmlTableCellProps(props)
  );
};

TdRenderer.model = tdModel;

export default TdRenderer;
