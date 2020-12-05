import { Dimensions, StyleProp } from 'react-native';
import {
  constructStyles,
  HtmlAttributesDictionary,
  PassProps
} from 'react-native-render-html';
import extractHtmlAndStatsFromTableDomNode from './extractHtmlAndStatsFromTableDomNode';
import { HTMLTableProps, TableConfig } from './types';

/**
 * Extract props for the HTMLTable component from renderer function arguments.
 * This function is especially usefull for custom table renderers.
 *
 * @param htmlAttribs - The HTML node attributes.
 * @param convertedCSSStyles - Converted inline styles.
 * @param passProps - Passed props.
 * @param tableConfig - Override config options.
 *
 * @public
 */
export default function extractHtmlTableProps(
  htmlAttribs: HtmlAttributesDictionary,
  convertedCSSStyles: StyleProp<any>,
  passProps: PassProps<any>,
  tableConfig?: TableConfig
): HTMLTableProps & { key: string | number } {
  const {
    WebView,
    onLinkPress,
    defaultWebViewProps,
    key,
    domNode,
    contentWidth,
    computeEmbeddedMaxWidth,
    renderersProps: { table: globalTableConfig } = {}
  } = passProps;
  const resolvedConfig: TableConfig = {
    ...globalTableConfig,
    ...tableConfig,
    webViewProps: {
      ...defaultWebViewProps,
      ...globalTableConfig?.webViewProps,
      ...tableConfig?.webViewProps
    }
  };
  const resolvedContentWidth =
    typeof contentWidth === 'number'
      ? contentWidth
      : Dimensions.get('window').width;
  const availableWidth =
    computeEmbeddedMaxWidth?.call(null, resolvedContentWidth, 'table') ||
    resolvedContentWidth;
  const { html, stats } = extractHtmlAndStatsFromTableDomNode(domNode);
  const displayMode = resolvedConfig.displayMode || 'normal';
  const style = constructStyles({
    tagName: 'table',
    htmlAttribs,
    passProps,
    styleSet: 'VIEW',
    additionalStyles: [
      convertedCSSStyles,
      displayMode === 'expand'
        ? { width: availableWidth }
        : displayMode === 'embedded'
        ? { maxWidth: availableWidth }
        : null
    ],
    baseFontStyle: passProps.baseFontStyle
  });

  if (__DEV__ && !WebView) {
    console.warn(
      "@native-html/table-plugin: You must pass a WebView component from react-native-webview as a prop to the HTML component. The iframe won't be rendered."
    );
  }
  return {
    ...resolvedConfig,
    ...stats,
    key,
    html,
    style,
    onLinkPress,
    WebView: WebView as any
  };
}
