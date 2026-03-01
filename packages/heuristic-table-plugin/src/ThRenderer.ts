import React from 'react';
import { CustomBlockRenderer } from '@native-html/render';
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
