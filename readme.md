# Table support for react-native-render-html

![npm](https://img.shields.io/npm/v/react-native-render-html-table-bridge.svg)
![DL/month](https://img.shields.io/npm/dm/react-native-render-html-table-bridge.svg)

```bash
npm add --save react-native-render-html-table-bridge
```

```bash
yarn add react-native-render-html-table-bridge
```

**Features**:

- Render HTML tables with a `WebView` component you provide
- Supports `<HTML>onLinkPress` prop to handle clicks
- Automatic height

<img src="images/android.gif" width="300">

**Known Limitations**:

- don't forget you're rendering cells inside a webview, so you won't be able to apply your custom renderers there
- limited support of Expo &lt;33 version ; full support [&ge;33 versions](https://github.com/expo/expo/milestone/22) (see bellow limitation)
- `autoheight` and `onLinkPress` config options only work with [`WebView` &ge; `v5.0.0` community edition](https://github.com/react-native-community/react-native-webview/releases/tag/v2.14.0)

## Minimal working example

*[Full example](examples/simple)*

You need 3 conditions to get to a working example:

1. Provide import for `WebView` component. [Instructions will differ depending on your setup](#errors-when-importing-webview-component);
2. Inject `alterNode` and `ignoredTags` props to `HTML` component;
3. `makeTableRenderer` and inject `renderers` prop to `HTML` component.

```javascript
import React, {PureComponent} from 'react';
import {ScrollView} from 'react-native';
import HTML from 'react-native-render-html';
import { IGNORED_TAGS, alterNode, makeTableRenderer } from 'react-native-render-html-table-bridge';
import WebView from 'react-native-webview'; // <-- Instructions might differ depending on your setup

const html = `
<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
  </tr>
  <tr>
    <td>Entry First Line 1</td>
    <td>Entry First Line 2</td>
  </tr>
</table>
`;

const config = {
    WebViewComponent: WebView
};

const renderers = {
  table: makeTableRenderer(config)
};

const htmlConfig = {
  alterNode,
  renderers,
  ignoredTags: IGNORED_TAGS
};

export default class Example extends PureComponent<Props> {
  render() {
    return (
      <ScrollView>
        <HTML html={html} {...htmlConfig}/>
      </ScrollView>
    )
  }
}
```

## API Reference

The complete API reference is available here: [doc/react-native-render-html-table-bridge.md](doc/react-native-render-html-table-bridge.md).

## Troubleshooting


<a name="errors-when-importing-webview-component" />

### Errors when importing `WebView` component

Setting up `WebView` component largely vary on your `react-native` or `expo` version.
Please refer to the official documentation and make sure you have selected your RN / Expo SDK version:

- [Expo](https://docs.expo.io/versions/latest/sdk/webview/);
- [React Native](https://facebook.github.io/react-native/docs/webview).

### Typescript errors

If you encounter typescript errors, chances are you are not following `peerDependencies` rules. Make sure you follow these rules:

| react-native-render-html | Bridge   |
|--------------------------|----------|
| ≤ 4.2.0                  | ≤ 0.5.3  |
|  ≥ 4.2.1                 |  ≥ 0.6.0 |

## FAQ

<a name="extend-styles" />

### How to extend default or custom styles?

**A**: Use `cssRulesFromSpecs` function and override `cssRules` config.

```javascript
import { defaultTableStylesSpecs, cssRulesFromSpecs } from 'react-native-render-html-table-bridge';

const cssRules = cssRulesFromSpecs(defaultTableStylesSpecs) + `
a {
  text-transform: uppercase;
}
`

const config = {
  cssRules,
  // Other config options
}

```

### How to customize the Table component?

**A**: Use `makeCustomTableRenderer` function. [See custom example](examples/custom).

<img src="images/adaptative.jpeg" width="300">

### How to load custom fonts?

**A**: Extend styles and add `@font-face` rules.

```javascript
import { defaultTableStylesSpecs, cssRulesFromSpecs } from 'react-native-render-html-table-bridge';
import { Platform } from 'react-native';

function getFontAssetURL(fontFileName: string) {
  return Platform.select({
    ios: `url(${fontFileName})`,
    android: `url(file://android_asset/fonts/${fontFileName})`
  })
}

const openSansUnicodeRanges = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const openSansRegular = getFontAssetURL('OpenSans-Regular.ttf');

const cssRules = cssRulesFromSpecs({
  ...defaultTableStylesSpecs,
  fontFamily: '"Open Sans"' // beware to quote font family name!
}) + `
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  src: ${openSansRegular}, format('ttf');
  unicode-range: ${openSansUnicodeRanges};
}
`;

const config = {
  cssRules,
  // Other config options
}

```

### How to use with Jest?

**A**: Add a `react-native-render-html-table-bridge.js` file to your `__mocks__` folder (this folder should be at the root of your project) with the following content:

``` js
const IGNORED_TAGS = [];
const alterNode = jest.fn();
const makeTableRenderer = jest.fn();

export {
	IGNORED_TAGS,
	alterNode,
	makeTableRenderer,
};

```
