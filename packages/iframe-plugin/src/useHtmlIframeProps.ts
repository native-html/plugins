import { Dimensions } from 'react-native';
import {
  CustomTagRendererProps,
  useDocumentMetadata,
  useSharedProps,
  useNormalizedUrl
} from 'react-native-render-html';
import extractPrintDimensions, {
  ExtractPrintDimensionsParams
} from './extractPrintDimensions';
import { IframeConfig, HTMLIframeProps } from './HTMLIframe';
import type { TBlock } from '@native-html/transient-render-engine';

const defaultIframeConfig: IframeConfig = {
  webViewProps: {
    allowsFullscreenVideo: true
  }
};

/**
 * Extract props for the HTMLIframe component from renderer function arguments.
 * This function is especially usefull for custom iframe renderers.
 *
 * @param props - The props of a custom block renderer.
 * @param iframeConfig - Override config options.
 *
 * @public
 */
export default function useHtmlIframeProps(
  { key, style, tnode }: CustomTagRendererProps<TBlock>,
  iframeConfig?: IframeConfig
): HTMLIframeProps | null {
  const {
    WebView,
    onLinkPress,
    defaultWebViewProps,
    contentWidth,
    computeEmbeddedMaxWidth,
    renderersProps: { iframe: globalIframeConfig } = {}
  } = useSharedProps();
  const resolvedConfig = {
    ...defaultIframeConfig,
    ...globalIframeConfig,
    ...iframeConfig,
    webViewProps: {
      ...defaultWebViewProps,
      ...defaultIframeConfig.webViewProps,
      ...globalIframeConfig?.webViewProps,
      ...iframeConfig?.webViewProps
    }
  };
  const resolvedContentWidth =
    typeof contentWidth === 'number'
      ? contentWidth
      : Dimensions.get('window').width;
  const documentBaseUrl = useDocumentMetadata().baseUrl;
  const availableWidth =
    computeEmbeddedMaxWidth?.call(null, resolvedContentWidth, 'iframe') ||
    resolvedContentWidth;
  const htmlAttribs = tnode.attributes;
  const normalizedUrl = useNormalizedUrl(htmlAttribs.src);
  const { width, height, ...restStyle } = style;
  const attrWidth = Number(htmlAttribs.width);
  const attrHeight = Number(htmlAttribs.height);
  const printConfig: ExtractPrintDimensionsParams = {
    attrWidth: Number.isNaN(attrWidth) ? null : attrWidth,
    attrHeight: Number.isNaN(attrHeight) ? null : attrHeight,
    styleWidth: typeof width === 'string' ? null : width,
    styleHeight: typeof height === 'string' ? null : height,
    contentWidth: availableWidth
  };
  const { printWidth, printHeight } = extractPrintDimensions(printConfig);
  const scaleFactor =
    typeof printConfig.attrWidth === 'number' &&
    printConfig.attrWidth > printWidth
      ? printWidth / attrWidth
      : 1;

  const source = htmlAttribs.srcdoc
    ? { html: htmlAttribs.srcdoc as string, baseUrl: documentBaseUrl }
    : { uri: normalizedUrl };

  if (__DEV__ && !WebView) {
    console.warn(
      "@native-html/iframe-plugin: You must pass a WebView component from react-native-webview as a prop to the HTML component. The iframe won't be rendered."
    );
  }
  return WebView
    ? {
        ...resolvedConfig,
        key,
        source,
        onLinkPress,
        htmlAttribs,
        scaleFactor,
        style: [restStyle, { width: printWidth, height: printHeight }],
        WebView
      }
    : null;
}
