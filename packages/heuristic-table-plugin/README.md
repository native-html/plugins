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
  🔠 A 100% native component using heuristics to render tables in @native-html/render.
</p>

<hr/>

```sh
npm add --save @native-html/heuristic-table-plugin
```

```sh
yarn add @native-html/heuristic-table-plugin
```

## Minimal working example

```javascript
import React from 'react';
import { ScrollView } from 'react-native';
import HTML from '@native-html/render';
import tableRenderers, {colgroupModel} from '@native-html/heuristic-table-plugin';

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
  customHTMLElementModels: {
    // Required for widths declared by <colgroup> and <col>.
    colgroup: colgroupModel
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
## Configuration

To change the layout of cells and other options, you can pass a config object
to the `renderersProps.table` prop of `RenderHTML` component.

See the documentation for this object here: [`HeuristicTablePluginConfig`](docs/heuristic-table-plugin.heuristictablepluginconfig.md)

### Cell padding

As in HTML, where the user-agent stylesheet declares `td, th { padding: 1px }`,
cells are padded by one pixel on every side they declare no padding for. It is
a user-agent declaration, so any author padding outranks it, side by side: a
cell with `padding-left: 8px` keeps the default pixel on the three sides it
left alone, and `padding: 0` removes it altogether. A padding from
`getStyleForCell`, shorthand included, replaces it too.

Callback padding overrides the source padding on the sides it covers, including
resolved user-agent styles and inline CSS. For example, `{ padding: 8 }` sets
every side to 8 even if the cell declares `padding-left: 4px`; a callback's own
`paddingLeft` still takes precedence over its `padding` shorthand.

`getStyleForCell` padding and borders participate in layout. The plugin first
calculates provisional cell widths from source styles, calls the callback once
per cell, then calculates final widths using its returned styles. Those same
styles are reused when rendering, including when borders collapse.

The callback's `cell.width` and constraints are **provisional**: they do not yet
include its returned styles. Width-dependent callbacks are not repeatedly
evaluated, so a callback that switches padding at a width threshold cannot
create a layout loop. Keep the callback referentially stable; changing it
recalculates the layout.

In collapsed mode, shared borders are resolved against adjacent cells. If a
spanning cell meets several differently styled borders along one side, the
strongest border is used for that whole side. Native Views also have one border
style for all sides, so the strongest winning style is used for the View.

## Custom Renderers

### Customizing Root renderer

You can customize the renderer logic thanks to `useHtmlTableProps` hook and `HTMLTable` exports:

```jsx
import React from 'react';
import tableRenderers, {useHtmlTableProps, HTMLTable} from '@native-html/heuristic-table-plugin';

function TableRenderer(props) {
  const tableProps = useHtmlTableProps(props, /* config */);
  // Do customize the props here; wrap with your own container...
  return <HTMLTable {..tableProps} />;
};

const renderers = {
  ...tableRenderers,
  table: TableRenderer
}

// use "renderers" prop in your RenderHTML instance
```

### Customizing Th and Td renderers

You can customize cell rendering via `useHtmlTableCellProps`, `thModel` and
`tdModel` exports. This renderer will receive a special `propsFromParent` of
type
[`TableCellPropsFromParent`](docs/heuristic-table-plugin.tablecellpropsfromparent.md).
You can take advantage of this information to customize depending on the
position of the cell in the grid system coordinate, as shown below:

```jsx
import React from 'react';
import {
  TableRenderer,
  ThRenderer,
  useHtmlTableCellProps,
  tdModel
} from '@native-html/heuristic-table-plugin';

function TdRenderer(props) {
  const cellProps = useHtmlTableCellProps(props);
  // The cell parent prop contains information about this cell,
  // especially its position (x, y) and lengths (lenX, lenY).
  // In this example, we customize the background depending on the
  // y coordinate (row index).
  const { cell } = cellProps.propsFromParent;
  const style = [
    cellProps.style,
    backgroundColor: cell.x % 2 === 0 ? 'lightgray' : 'white'
  ]
  return React.createElement(cellProps.TDefaultRenderer, { ...cellProps, style });
}

const renderers = {
  table: TableRenderer,
  td: TdRenderer,
  th: ThRenderer
}

// use "renderers" prop in your RenderHTML instance
```


## The heuristic layout algorithm

Finding the cell sizes which result in the table of the least height given a
fixed width is [a NP complete
problem](https://dl.acm.org/doi/abs/10.1145/304893.304937).

To resolve this problem, this library uses a dumb and cheap algorithm, which
won't find the *best* solution but instead a visually acceptable layout.

### 0. Available width resolution

`contentWidth` is published once, at the root of the render tree, and is never
narrowed as the engine descends. Before anything else, the table walks up its
ancestors and subtracts the horizontal spacing each one imposes — padding,
border and margin — along with any explicit width they declare. Its own
margins come off next, and its own padding and border after that, since a
React Native `width` is a border box. What is left is the width its columns
may occupy.

A table inside `<div style="padding: 20px">` therefore lays out against
`contentWidth - 40` and stays inside its parent, rather than overflowing it
into a horizontal scroller.

### 1. Cell constraints extraction

In the first step, each cell of the table is parsed to extract three metrics:

- `minWidth`, an estimate of the cell's min-content width: its longest
  unbreakable text run or the greatest width imposed by one of its blocks,
  plus horizontal spacing — the cell's borders and padding, the
  [default cell padding](#cell-padding) included. Margins take no part: the
  cell renderer zeroes them, so column width reserved for one would only
  leave a gap nothing paints;
- `maxWidth`, the width beyond which the cell would gain nothing, bounded by
  the cell's own `max-width` but never below `minWidth`;
- `contentDensity`, the sum of the estimated widths of all text; forced
  line breaks do not reduce this density. `maxWidth` instead uses the widest
  forced line, keeping text on separate lines from widening the column.

### 2. Column constraints reduction

In the second step, cell constraints are reduced per column. Three metrics come out:

- `minWidth`, the maximum of each cell `minWidth`;
- `contentDensity`, the sum of each cell `contentDensity`;
- `spread`, the maximum of each cell `maxWidth`, never below the column's
  `minWidth`.

Widths and bounds declared by `<colgroup>` and `<col>` are then folded into
these constraints. Percentage widths from cells, columns, and column groups remain preferences
until distribution. Cell percentages are combined by maximum across rows;
a spanning cell shares its percentage across the columns it covers.

### 3. Column widths calculation

If the sum of the column minimums exceeds the assignable width, every column
keeps its `minWidth` and the table scrolls horizontally. Otherwise, the
algorithm grows columns in passes:

1. Percentage columns move from their minimums toward their declared shares.
2. Auto and absolute-width columns move toward their max-content `spread`.
3. When the table must stretch, any remaining width is distributed among
   columns that have room below their declared caps.

Each intermediate pass is interpolated to keep the result within the
assignable table width. Space that no column can accept is left unassigned.

`forceStretch` defaults to `true`, so a table fills the width its containing
block leaves it. Set it to `false` in `renderersProps.table` to let an
auto-width table shrink to fit its content instead. A table with an explicit
width always distributes that width over its columns, whatever `forceStretch`
is set to.

### Table and cell heights

Per [CSS 2.1 §17.5.3](https://www.w3.org/TR/CSS21/tables.html#height-layout),
`height` on a `table`, `tr`, `th` or `td` box is only a *minimum*: the box
always grows to fit its content. React Native has no table layout algorithm to
shrink a row back down, so this plugin enforces a declared `height` as written
by default, and taller content overflows it.

Set `growBeyondHeight` to `true` in `renderersProps.table` to get the CSS
behavior instead: an explicit `height` on the table or on any of its cells is
folded into `minHeight`, and the box grows past it to fit its content.

```tsx
<RenderHTML
  source={{ html }}
  renderersProps={{ table: { growBeyondHeight: true } }}
/>
```
