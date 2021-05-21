import { Dimensions } from 'react-native';
import {
  CustomTagRendererProps,
  useSharedProps,
  useDocumentMetadata,
  useRendererProps,
  useContentWidth
} from 'react-native-render-html';
import extractHtmlAndStatsFromTableDomNode from './extractHtmlAndStatsFromTableDomNode';
import { HTMLTableProps, TableConfig } from './types';
import type { TBlock } from '@native-html/transient-render-engine';

/**
 * Extract props for the HTMLTable component from renderer function arguments.
 * This function is especially usefull for custom table renderers.
 *
 * @param props - The props of a custom block renderer.
 * @param tableConfig - Override config options.
 *
 * @public
 */
export default function useHtmlTableProps(
  { key, style, tnode }: CustomTagRendererProps<TBlock>,
  tableConfig?: TableConfig
): (HTMLTableProps & { key?: string | number }) | null {
  const {
    WebView,
    defaultWebViewProps,
    computeEmbeddedMaxWidth
  } = useSharedProps();
  const contentWidth = useContentWidth();
  const globalTableConfig = useRendererProps('table');
  const { onPress: onLinkPress } = useRendererProps('a');
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
  const documentBaseUrl = useDocumentMetadata().baseUrl;
  const availableWidth =
    computeEmbeddedMaxWidth?.call(null, resolvedContentWidth, 'table') ||
    resolvedContentWidth;
  const { html, stats } = extractHtmlAndStatsFromTableDomNode(tnode.domNode);
  const displayMode = resolvedConfig.displayMode || 'normal';
  const composedStyles = [
    style,
    displayMode === 'expand'
      ? { width: availableWidth }
      : displayMode === 'embedded'
      ? { maxWidth: availableWidth }
      : null
  ];

  if (__DEV__ && !WebView) {
    console.warn(
      "@native-html/table-plugin: You must pass a WebView component from react-native-webview as a prop to the HTML component. The table won't be rendered."
    );
  }
  return WebView
    ? {
        ...resolvedConfig,
        ...stats,
        key,
        html,
        sourceBaseUrl: documentBaseUrl,
        style: composedStyles,
        onLinkPress,
        WebView
      }
    : null;
}
