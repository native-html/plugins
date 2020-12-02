import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { RendererFunction, constructStyles } from 'react-native-render-html';
import extractPrintDimensions from './extractPrintWidth';
import HTMLIframe from './HTMLIframe';

function normalizeUri(uri: string): string {
  return uri.startsWith('//') ? `https:${uri}` : uri;
}

const iframe: RendererFunction = function iframe(
  htmlAttribs,
  _children,
  convertedCSSStyles,
  passProps
) {
  const { WebView, contentWidth, onLinkPress } = passProps;
  const { width, height, ...restStyle } = StyleSheet.flatten(
    constructStyles({
      tagName: 'iframe',
      htmlAttribs,
      passProps,
      styleSet: 'VIEW',
      additionalStyles: [convertedCSSStyles],
      baseFontStyle: passProps.baseFontStyle || ({} as any)
    })
  );

  const attrWidth = Number(htmlAttribs.width);
  const attrHeight = Number(htmlAttribs.height);
  const { printWidth, printHeight } = extractPrintDimensions({
    attrWidth: Number.isNaN(attrWidth) ? null : attrWidth,
    attrHeight: Number.isNaN(attrHeight) ? null : attrHeight,
    styleWidth: width,
    styleHeight: height,
    contentWidth: contentWidth || Dimensions.get('window').width
  });

  const source = htmlAttribs.srcdoc
    ? { html: htmlAttribs.srcdoc as string }
    : { uri: normalizeUri(htmlAttribs.src as string) };

  if (__DEV__ && !WebView) {
    console.warn(
      "@native-html/iframe-plugin: You must pass a WebView component from react-native-webview as a prop to the HTML component. The iframe won't be rendered."
    );
  }

  return WebView ? (
    <HTMLIframe
      key={passProps.key}
      source={source}
      style={[restStyle, { width: printWidth, height: printHeight }]}
      WebView={WebView}
      htmlAttribs={htmlAttribs}
      onLinkPress={onLinkPress}
    />
  ) : null;
};

export default iframe;
