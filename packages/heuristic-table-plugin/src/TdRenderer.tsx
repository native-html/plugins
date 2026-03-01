import React from 'react';
import { CustomBlockRenderer } from '@native-html/render';
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
