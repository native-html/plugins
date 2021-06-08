import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import useHtmlTableCellProps from './useHtmlTableCellProps';

/**
 * The renderer component for `th` tag.
 *
 * @param props - Component props.
 * @public
 */
const ThRenderer: CustomBlockRenderer = function ThRenderer(props) {
  return React.createElement(
    props.TDefaultRenderer,
    useHtmlTableCellProps(props)
  );
};

export default ThRenderer;
