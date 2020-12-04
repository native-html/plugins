import React, { ComponentType, useCallback, useMemo } from 'react';
import {
  HandleLinkPressFeature,
  ForceResponsiveViewportFeature,
  LinkPressTarget,
  useWebshell
} from '@formidable-webview/webshell';
import { StyleProp, ViewStyle } from 'react-native';
import {
  ContainerProps,
  HtmlAttributesDictionary
} from 'react-native-render-html';

/**
 * Configuration options for the HTMLIframe component.
 * You can pass those options through `renderersProps.iframe`
 * HTML prop.
 *
 * @public
 */
export interface HTMLIframeConfig {
  /**
   * When the iframe attribute width is wider than the contentWidth, scales
   * down the viewport so that it doesn't overflows horizontally.
   *
   * @defaultvalue true
   */
  autoscale: boolean;
}

/**
 * Props for the HTMLIframe component.
 *
 * @public
 */
export interface HTMLIframeProps<WebViewProps = any> extends HTMLIframeConfig {
  /**
   * The `WebView` Component you wish to use.
   */
  WebView: ComponentType<WebViewProps>;
  webViewProps?: WebViewProps;
  source: { uri?: string; html?: string };
  style: StyleProp<ViewStyle>;
  onLinkPress?: ContainerProps['onLinkPress'];
  htmlAttribs: HtmlAttributesDictionary;
  /**
   * When autoscale is enabled, scales the WebView zoom level to make sure the
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
  autoscale = true
}: HTMLIframeProps) {
  const scaleFeature = useMemo(
    () =>
      autoscale
        ? new ForceResponsiveViewportFeature({
            initScale: scaleFactor,
            maxScale: scaleFactor,
            minScale: scaleFactor
          })
        : null,
    [scaleFactor, autoscale]
  );
  const onDOMLinkPress = useCallback(
    ({ uri }: LinkPressTarget) =>
      onLinkPress?.call(null, { nativeEvent: {} } as any, uri, htmlAttribs),
    [onLinkPress, htmlAttribs]
  );
  const webViewProps = useWebshell({
    features: [...features, scaleFeature as any],
    props: {
      ...userWebViewProps,
      onDOMLinkPress,
      style,
      source,
      testID: 'iframe',
      allowsFullscreenVideo: true
    }
  });
  return React.createElement(WebView, webViewProps);
}
