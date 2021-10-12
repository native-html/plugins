import { Dimensions } from 'react-native';
import {
  CustomRendererProps,
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
  { style, tnode }: CustomRendererProps<TBlock>,
  tableConfig?: TableConfig
): HTMLTableProps {
  const { WebView, defaultWebViewProps, computeEmbeddedMaxWidth } =
    useSharedProps();
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

  return {
    ...resolvedConfig,
    ...stats,
    html,
    sourceBaseUrl: documentBaseUrl,
    style: composedStyles,
    onLinkPress,
    WebView
  };
}
