import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import useHtmlTableCellProps from './useHtmlTableCellProps';

/**
 * The renderer component for `td` tag.
 *
 * @param props - Component props.
 * @public
 */
const TdRenderer: CustomBlockRenderer = function TdRenderer(props) {
  return React.createElement(
    props.TDefaultRenderer,
    useHtmlTableCellProps(props)
  );
};

export default TdRenderer;
