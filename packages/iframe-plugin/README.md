> :warning: This documentation is for **react-native-render-html v6** (@native-html/iframe-plugin@2.x). For v5, [go here](https://github.com/native-html/plugins/tree/rnrh/5.x/packages/iframe-plugin#readme).

<h1 align="center">@native-html/iframe-plugin</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@native-html/iframe-plugin"
    ><img
      src="https://img.shields.io/npm/v/@native-html/iframe-plugin"
      alt="npm"
  /></a>
  <a href="https://semver.org/spec/v2.0.0.html"
    ><img
      src="https://img.shields.io/badge/semver-2.0.0-e10079.svg"
      alt="semver"
  /></a>
  <a href="https://codecov.io/gh/native-html/plugins?flag=iframe-plugin"
    ><img
      src="https://codecov.io/gh/native-html/plugins/branch/master/graph/badge.svg?flag=iframe-plugin"
      alt="codecov"
  /></a>
  <a
    href="https://github.com/native-html/plugin/actions?query=branch%3Amaster+workflow%3Aiframe"
    ><img
      src="https://github.com/native-html/plugins/workflows/iframe/badge.svg?branch=master"
      alt="CI"
  /></a>
  <a href="https://discord.gg/3B9twTMEzb">
    <img
    src="https://img.shields.io/discord/736906960041148476?label=discord"
    alt="Discord"
  />
</a>
</p>

<p align="center">
  🌐 A WebView-based plugin to render iframes in react-native-render-html.
</p>

<p align="center">
  <img
    src="https://github.com/native-html/plugins/raw/master/images/expo-example.png"
  />
</p>
<div align="center">
  <a href="https://expo.io/@jsamr/projects/native-html-plugins-examples"
    >Try it on Expo!</a
  >
</div>

<hr/>

**Install**:

> :warning: With expo, use `expo install` instead to grab a compatible
> `react-native-webview` version.

```sh
npm add --save @native-html/iframe-plugin react-native-webview
```

```sh
yarn add @native-html/iframe-plugin react-native-webview
```

**Features**:

- Supports `onLinkPress`;
- Supports `defaultWebViewProps`;
- Compliance with [RFC001](https://github.com/meliorence/react-native-render-html/blob/master/rfc/001-A-deterministic-approach-to-embedded-content-scaling.adoc#L13): scales to available width;
- Autoscale feature (adapt zoom level to available width! Disabled by default.);
- A single renderer component exported as default, super easy to plug-in!
- Compatible with `react-native-web` via [`@formidable-webview/web`](https://github.com/formidable-webview/ubiquitous/tree/master/packages/web#readme)

**Known Limitations**:

- With `react-native-web`, `onLinkPress` will not work for external domains.

## Compat Table

| react-native-render-html | @native-html/iframe-plugin                                          |
| ------------------------ | ------------------------------------------------------------------- |
| ≥ 5.0.0 &lt; 6.0.0       | 1.x ([documentation](/tree/rnrh/5.x/packages/iframe-plugin#readme)) |
| ≥ 6.0.0                  | 2.x ([documentation](/tree/rnrh/6.x/packages/iframe-plugin#readme)  |

## Minimal working example

```jsx
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin';
import RenderHTML from 'react-native-render-html';
import WebView from 'react-native-webview';

const renderers = {
  iframe: IframeRenderer
}

const customHTMLElementModels = {
  iframe: iframeModel
}

// ...

<RenderHTML renderers={renderers}
      WebView={WebView}
      source={{ html: '<iframe ...></iframe>' }}
      customHTMLElementModels={customHTMLElementModels}
      defaultWebViewProps={{ /* Any prop you want to pass to all WebViews */ }}
      renderersProps={{ iframe: { scalesPageToFit: true, webViewProps: { /* Any prop you want to pass to iframe WebViews */ } }}}
/>

```

## Customizing

To customize the behavior of this renderer, you can pass a config object
to the `renderersProps.iframe` prop of `RenderHTML` component.

See the documentation for this object here: [`IframeConfig`](docs/iframe-plugin.iframeconfig.md).

## Zoom on the autoscale feature

When `scalesPageToFit` is set to true, if the iframe width (as determined by the
`width` element attribute) is greater than the available width (as determined
by HTML props `contentWidth` and `computeEmbeddedMaxWidth`), the `WebView` will
be zoomed out by just the right amount to have no horizontal cropping. This is
equivalent to `resizeMode: 'contain'` for images. See example below with
`scalesPageToFit` enabled (left) and disabled (right):

![](/blob/master/images/scalesPageToFit.jpg)

## Customizing the renderer

You can customize the renderer logic thanks to `useHtmlIframeProps` hook, `iframeModel` and `HTMLIframe` exports:

```jsx
import {useHtmlIframeProps, HTMLIframe, iframeModel} from '@native-html/iframe-plugin';

const IframeRenderer = function IframeRenderer(props) {
  const iframeProps = useHtmlIframeProps(props);
  // Do customize the props here; wrap with your own container...
  return iframeProps ? <HTMLIframe {...iframeProps} /> : null;
};

const renderers = {
  iframe: IframeRenderer
}

// use "renderers" prop in your RenderHTML instance
```

## API Reference

Documentation for all exports of this library [is available here](docs/iframe-plugin.md).
