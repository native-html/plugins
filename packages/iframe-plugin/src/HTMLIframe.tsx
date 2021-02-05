import React, { ComponentType, useCallback, useMemo } from 'react';
import {
  HandleLinkPressFeature,
  ForceResponsiveViewportFeature,
  LinkPressTarget,
  useWebshell
} from '@formidable-webview/webshell';
import { StyleProp, ViewStyle } from 'react-native';
import {
  RenderHTMLPassedProps,
  HtmlAttributesDictionary
} from 'react-native-render-html';

/**
 * Configuration options for the HTMLIframe component.
 * You can pass those options through `renderersProps.iframe`
 * HTML prop.
 *
 * @public
 */
export interface IframeConfig {
  /**
   * When the iframe attribute width is wider than the contentWidth, scales
   * down the viewport so that it doesn't overflows horizontally.
   *
   * @remarks Although it looks like the eponymous `WebView` prop, it works
   * both on iOS and Android.
   *
   * @defaultvalue false
   */
  scalesPageToFit?: boolean;
  /**
   * Any props you'd like to pass to the `WebView` component.
   *
   * @remarks
   * `source` and `javascriptEnabled` will be ignored and overriden.
   */
  webViewProps?: any;
}

/**
 * Props for the HTMLIframe component.
 *
 * @public
 */
export interface HTMLIframeProps<WebViewProps = any> extends IframeConfig {
  /**
   * The `WebView` Component you wish to use.
   */
  WebView: ComponentType<WebViewProps>;
  webViewProps?: WebViewProps;
  source: { uri?: string; html?: string };
  style: StyleProp<ViewStyle>;
  onLinkPress?: RenderHTMLPassedProps['onLinkPress'];
  htmlAttribs: HtmlAttributesDictionary;
  /**
   * When scalesPageToFit is enabled, scales the WebView zoom level to make sure the
   * viewport fits contentWidth.
   */
  scaleFactor: number;
}

const features = [new HandleLinkPressFeature({ preventDefault: true })];

/**
 * A component to render iframes in react-native-render-html.
 *
 * @public
 */
export default function HTMLIframe({
  WebView,
  webViewProps: userWebViewProps,
  source,
  style,
  onLinkPress,
  htmlAttribs,
  scaleFactor,
  scalesPageToFit = false
}: HTMLIframeProps) {
  const scaleFeature = useMemo(
    () =>
      scalesPageToFit
        ? new ForceResponsiveViewportFeature({
            initScale: scaleFactor,
            maxScale: scaleFactor,
            minScale: scaleFactor
          })
        : null,
    [scaleFactor, scalesPageToFit]
  );
  const onDOMLinkPress = useCallback(
    ({ uri }: LinkPressTarget) =>
      onLinkPress?.call(
        null,
        { nativeEvent: {} } as any,
        uri,
        htmlAttribs,
        (htmlAttribs.target as any) || '_self'
      ),
    [onLinkPress, htmlAttribs]
  );
  const webViewProps = useWebshell({
    features: [...features, scaleFeature as any],
    props: {
      ...userWebViewProps,
      onDOMLinkPress,
      style,
      source,
      testID: 'iframe'
    }
  });
  return React.createElement(WebView, webViewProps);
}
