> :warning: This documentation is for **react-native-render-html v6** (@native-html/table-plugin@4.x). For v5 and below, [go here](https://github.com/native-html/plugins/tree/rnrh/5.x/packages/table-plugin#readme).

<h1 align="center">@native-html/table-plugin</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@native-html/table-plugin"
    ><img
      src="https://img.shields.io/npm/v/@native-html/table-plugin"
      alt="npm"
  /></a>
  <a href="https://semver.org/spec/v2.0.0.html"
    ><img
      src="https://img.shields.io/badge/semver-2.0.0-e10079.svg"
      alt="semver"
  /></a>
  <a href="https://codecov.io/gh/native-html/plugins?flag=table-plugin"
    ><img
      src="https://codecov.io/gh/native-html/plugins/branch/master/graph/badge.svg?flag=table-plugin"
      alt="codecov"
  /></a>
  <a
    href="https://github.com/native-html/plugins/actions?query=branch%3Amaster+workflow%3Atable"
    ><img
      src="https://github.com/native-html/plugins/workflows/table/badge.svg?branch=master"
      alt="CI"
  /></a>
  <a href="https://www.npmjs.com/package/@native-html/table-plugin">
    <img
      src="https://img.shields.io/npm/dm/@native-html/table-plugin.svg"
      alt="DL/month"
    />
  </a>
  <a href="https://discord.gg/3B9twTMEzb">
      <img
      src="https://img.shields.io/discord/736906960041148476?label=discord"
      alt="Discord"
    />
  </a>
</p>

<p align="center">
  🔠 A WebView-based plugin to render tables in react-native-render-html.
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
<div align="center">
  <img
    src="https://github.com/native-html/table-plugin/raw/master/images/android.gif"
    width="300"
  />
</div>
<hr/>

```sh
npm add --save @native-html/table-plugin
```

```sh
yarn add @native-html/table-plugin
```

**Features**:

- Render HTML tables with a `WebView` component you provide;
- Supports `HTML.onLinkPress` prop to handle clicks;
- Automatic height;
- Customize table style with ease.

**Known Limitations**:

- Don't forget you're rendering cells inside a webview, so you won't be able to apply your custom renderers there
- Limited support of Expo &lt;33 version ; full support [&ge;33 versions](https://github.com/expo/expo/milestone/22) (see bellow limitation)
- Autoheight behavior and `onLinkPress` config options only work with [`WebView` &ge; `v5.0.0` community edition](https://github.com/react-native-community/react-native-webview/releases/tag/v5.0.0)

## Compat Table

> :warning: The API is significantly different depending on target
> react-native-render-html version.
> **Make sure you check the appropriate version documentation before
> proceeding.**

| react-native-render-html | @native-html/table-plugin                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 4.2.1 &lt; 5.0.0       | 2.x ([documentation](https://github.com/native-html/plugins/tree/rnrh/4.x#readme))                                                                                                                                                            |
| ≥ 5.0.0 &lt; 6.0.0       | 3.x ([documentation](https://github.com/native-html/plugins/tree/rnrh/5.x/packages/table-plugin#readme))                                                                                                                                      |
| ≥ 6.0.0                  | 4.x ([documentation](https://github.com/native-html/plugins/tree/@native-html/table-plugin@4.0.3/packages/table-plugin#readme)) <br> 5.x ([documentation](https://github.com/native-html/plugins/tree/rnrh/6.x/packages/table-plugin#readme)) |

## Minimal working example

_[Full example](https://github.com/native-html/plugins/blob/master/example/SimpleExample.js)_

You need 2 steps to get to a working example:

1. Import the `WebView` component. [Instructions will differ depending on your setup](#errors-when-importing-webview-component);
2. Inject `renderers` and `WebView` props to the `HTML` component;

```javascript
import React from 'react';
import { ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import TableRenderer from '@native-html/table-plugin';
import WebView from 'react-native-webview';

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

const htmlProps = {
  WebView,
  renderers: {
    table: TableRenderer
  },
  renderersProps: {
    table: {
      // Put the table config here
    }
  }
};

export const Example = () => (
  <ScrollView>
    <HTML source={{ html }} {...htmlProps} />
  </ScrollView>
);
```

## API Reference

**The complete API reference is available here: [docs/table-plugin.md](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.md).**
Most notably, check [`TableConfig`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.tableconfig.md) to see how you can customize the table behavior.

**Landmark exports**:

- [`TableRenderer(default)`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.tablerenderer.md)
- [`useHtmlTableProps`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.usehtmltableprops.md)

Other exports:

- [`HTMLTable`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.htmltable.md)
- [`defaultTableStylesSpecs`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.defaulttablestylesspecs.md)
- [`cssRulesFromSpecs`](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.cssrulesfromspecs.md)

## Troubleshooting

<a name="errors-when-importing-webview-component" />

### Errors when importing `WebView` component

> :warning: **Always favor
> [`react-native-community/react-native-webview`](https://github.com/react-native-community/react-native-webview)
> over legacy `WebView` when possible.**

Setting up `WebView` component largely vary on your `react-native` or `expo` version.
Please refer to the official documentation and make sure you have selected your RN / Expo SDK version:

- [Expo](https://docs.expo.io/versions/latest/sdk/webview/);
- [React Native](https://facebook.github.io/react-native/docs/webview).

## FAQ

### How to easily style the table?

Use `TableConfig.tableStyleSpecs`. The options will get merged with defaults,
so you are not required to pass every field. See
[documentation](https://github.com/native-html/plugins/blob/master/packages/table-plugin/docs/table-plugin.tablestylespecs.md).

```javascript
import TableRenderer {
  defaultTableStylesSpecs,
  cssRulesFromSpecs
} from '@native-html/table-plugin';

const htmlProps = {
  renderers: { table: TableRenderer },
  renderersProps: {
    table: {
      tableStyleSpecs: {
        // my style specs
      }
    }
  }
};
```

### How to disable autoheight?

Pass `computeContainerHeight` option with a function returning `null`:

```javascript
import TableRenderer {
  defaultTableStylesSpecs,
  cssRulesFromSpecs
} from '@native-html/table-plugin';

const htmlProps = {
  renderers: { table: TableRenderer },
  renderersProps: {
    table: {
      computeContainerHeight() {
        return null;
      }
    }
  }
};

```

<a name="extend-styles" />

### How to extend default or custom styles?

**A**: Use `cssRulesFromSpecs` function and override `cssRules` config.

```javascript
import TableRenderer {
  defaultTableStylesSpecs,
  cssRulesFromSpecs
} from '@native-html/table-plugin';

const cssRules =
  cssRulesFromSpecs(defaultTableStylesSpecs) +
  `
a {
  text-transform: uppercase;
}
`;

const tableConfig = {
  cssRules
}

const htmlProps = {
  renderers: { table: TableRenderer },
  renderersProps: {
    table: {
      cssRules
    }
  }
};

```

### How to customize the Table component?

**A**: See `useHtmlTableProps` hook. [See custom example](https://github.com/native-html/plugins/blob/master/example/CustomExample.js).

<img src="https://github.com/native-html/table-plugin/raw/master/images/adaptative.jpeg" width="300">

### How to load custom fonts?

**A**: Extend styles and add `@font-face` rules.

```javascript
import TableRenderer, {
  defaultTableStylesSpecs,
  cssRulesFromSpecs
} from '@native-html/table-plugin';
import { Platform } from 'react-native';

function getFontAssetURL(fontFileName: string) {
  return Platform.select({
    ios: `url(${fontFileName})`,
    android: `url(file://android_asset/fonts/${fontFileName})`
  });
}

const openSansUnicodeRanges =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const openSansRegular = getFontAssetURL('OpenSans-Regular.ttf');

const cssRules =
  cssRulesFromSpecs({
    ...defaultTableStylesSpecs,
    fontFamily: '"Open Sans"' // beware to quote font family name!
  }) +
  `
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  src: ${openSansRegular}, format('ttf');
  unicode-range: ${openSansUnicodeRanges};
}
`;

const htmlProps = {
  renderers: { table: TableRenderer },
  renderersProps: {
    table: {
      cssRules
    }
  }
};
```
