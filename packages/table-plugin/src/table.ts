import React from 'react';
import { RendererFunction } from 'react-native-render-html';
import extractHtmlTableProps from './extractHtmlTableProps';
import { HTMLTable } from './HTMLTable';

/**
 * The renderer function for the iframe element. This renderer is fully
 * scalable, and will adjust to `contentWidth` and `computeEmbeddedMaxWidth`.
 * It also features `onLinkPress`.
 *
 * @param htmlAttribs - HTML attributes of the element.
 * @param children - The children (ignored)
 * @param convertedCSSStyles - Inline styles
 * @param passProps - Passed props from the root component.
 *
 * @public
 */
const table: RendererFunction<any> = function table(
  htmlAttribs,
  children,
  convertedCSSStyles,
  passProps
) {
  const props = extractHtmlTableProps(
    htmlAttribs,
    convertedCSSStyles,
    passProps
  );
  return props.WebView ? React.createElement(HTMLTable, props) : null;
};

export default table;
