import React, { ComponentType, useCallback, useMemo } from 'react';
import makeWebshell, {
  HandleLinkPressFeature,
  LinkPressTarget
} from '@formidable-webview/webshell';
import { StyleProp, ViewStyle } from 'react-native';
import {
  ContainerProps,
  HtmlAttributesDictionary
} from 'react-native-render-html';

export interface HTMLIframeProps<WebViewProps = any> {
  /**
   * The `WebView` Component you wish to use.
   */
  WebView: ComponentType<WebViewProps>;
  /**
   * Any props you'd like to pass to {@link TableConfig.WebView}.
   *
   * @remarks
   * `source` and `javascriptEnabled` will be ignored and overriden. Also, you
   * should pass a stable or memoized object to avoid extraneous renderings.
   * See `React.useMemo`.
   */
  webViewProps?: WebViewProps;
  source: { uri?: string; html?: string };
  key: string;
  style: StyleProp<ViewStyle>;
  onLinkPress?: ContainerProps['onLinkPress'];
  htmlAttribs: HtmlAttributesDictionary;
}

export default function HTMLIframe({
  WebView,
  webViewProps,
  source,
  style,
  key,
  onLinkPress,
  htmlAttribs
}: HTMLIframeProps) {
  const Webshell = useMemo(
    () =>
      makeWebshell(
        WebView,
        new HandleLinkPressFeature({ preventDefault: true })
      ),
    [WebView]
  );
  const onDOMLinkPress = useCallback(
    ({ uri }: LinkPressTarget) =>
      onLinkPress?.call(null, { nativeEvent: {} } as any, uri, htmlAttribs),
    [onLinkPress, htmlAttribs]
  );
  return (
    <Webshell
      testID="iframe"
      key={key}
      source={source}
      style={style}
      onDOMLinkPress={onDOMLinkPress}
      {...webViewProps}
    />
  );
}
