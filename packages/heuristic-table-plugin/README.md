> :warning: **This plugin is in active development and its API might change without notice. As long as it is unstable, it will be released with 0.X version scheme, as per the semver standard.**

<h1 align="center">@native-html/heuristic-table-plugin</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@native-html/heuristic-table-plugin"
    ><img
      src="https://img.shields.io/npm/v/@native-html/heuristic-table-plugin"
      alt="npm"
  /></a>
  <a href="https://semver.org/spec/v2.0.0.html"
    ><img
      src="https://img.shields.io/badge/semver-2.0.0-e10079.svg"
      alt="semver"
  /></a>
  <a href="https://codecov.io/gh/native-html/plugins?flag=heuristic-table-plugin"
    ><img
      src="https://codecov.io/gh/native-html/plugins/branch/master/graph/badge.svg?flag=heuristic-table-plugin"
      alt="codecov"
  /></a>
  <a
    href="https://github.com/native-html/plugins/actions?query=branch%3Amaster+workflow%3Aheuristic-table"
    ><img
      src="https://github.com/native-html/plugins/workflows/heuristic-table/badge.svg?branch=master"
      alt="CI"
  /></a>
  <a href="https://www.npmjs.com/package/@native-html/heuristic-table-plugin">
    <img
      src="https://img.shields.io/npm/dm/@native-html/heuristic-table-plugin.svg"
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
  🔠 A 100% native component using heuristics to render tables in react-native-render-html.
</p>

<hr/>

```sh
npm add --save @native-html/heuristic-table-plugin
```

```sh
yarn add @native-html/heuristic-table-plugin
```

## Compat Table

| react-native-render-html | @native-html/heuristic-table-plugin                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| &lt; 6.0.0               | -                                                                                                        |
| ≥ 6.0.0                  | 6.x ([documentation](https://github.com/native-html/plugins/tree/rnrh/6.x/packages/heuristic-table-plugin#readme)) |

## Minimal working example

```javascript
import React from 'react';
import { ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import tableRenderers from '@native-html/heuristic-table-plugin';

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
    ...tableRenderers
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

## Customizing

To change the layout of cells and other options, you can pass a config object
to the `renderersProps.table` prop of `RenderHTML` component.

See the documentation for this object here: [`HeuristicTablePluginConfig`](docs/heuristic-table-plugin.heuristictablepluginconfig.md)
