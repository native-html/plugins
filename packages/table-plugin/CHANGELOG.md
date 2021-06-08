# [5.3.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.2.0...@native-html/table-plugin@5.3.0) (2021-06-08)


### Features

* **table:** support react-native-render-html@6.0.0-beta.0 ([6de42c8](https://github.com/native-html/plugins/commit/6de42c860fcd2ed0323bd4bd7c86667b134fcf90))

# [5.2.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.1.0...@native-html/table-plugin@5.2.0) (2021-05-21)


### Features

* support react-native-render-html@6.0.0-alpha.25; beware of upstream breaking changes ([53e322c](https://github.com/native-html/plugins/commit/53e322cad64aece27d5c95c1bc9fb4a3095addbd))

# [5.1.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.0.3...@native-html/table-plugin@5.1.0) (2021-04-17)


### Features

* **table:** support react-native-render-html@6.0.0-alpha.23 ([604e76e](https://github.com/native-html/plugins/commit/604e76e60f99812a558e03ffc17ed877873cf7a4))

## [5.0.3](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.0.2...@native-html/table-plugin@5.0.3) (2021-04-17)


### Bug Fixes

* restrict to react-native-render-html < 6.0.0-alpha.23 ([3a8d9f8](https://github.com/native-html/plugins/commit/3a8d9f8fada412d5adae663338b4661a20b19be3))

## [5.0.2](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.0.1...@native-html/table-plugin@5.0.2) (2021-04-17)


### Bug Fixes

* restrict compatible versions of react-native-render-html ([032c4ed](https://github.com/native-html/plugins/commit/032c4ed035150471c914d6406fe7b2b2237035fe))

## [5.0.1](https://github.com/native-html/plugins/compare/@native-html/table-plugin@5.0.0...@native-html/table-plugin@5.0.1) (2021-02-18)


### Bug Fixes

* replace outdated type import `RenderHTMLPassedProps` ([872bc96](https://github.com/native-html/plugins/commit/872bc965d8b5c5e8e37430060a2edc343549623f))

# [5.0.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@4.0.3...@native-html/table-plugin@5.0.0) (2021-02-08)


### Features

* **table-plugin:** automatically handle relative URLs ([000b9b4](https://github.com/native-html/plugins/commit/000b9b44de3adb924901bee7fa131542af2b4bc4))


### BREAKING CHANGES

* **table-plugin:** `sourceBaseUrl` has been moved from `TableConfig` to
`HTMLTableBaseProps`. It means you cannot override this value with
`renderersProps.table.sourceBaseUrl` anymore. Use a custom renderer with
`useHtmlTableProps` hook and HTMLTable component to override this value
manually, but you probably shouldn't since the new foundry engines
allows it automatically. If your html source is inline, use
`source.baseUrl` instead, so that every relative URL will be normalized
against this base. Read https://git.io/JtwG0 for a detailed description.

## [4.0.3](https://github.com/native-html/plugins/compare/@native-html/table-plugin@4.0.2...@native-html/table-plugin@4.0.3) (2021-02-07)

## [4.0.2](https://github.com/native-html/plugins/compare/@native-html/table-plugin@4.0.1...@native-html/table-plugin@4.0.2) (2021-02-07)

## [4.0.1](https://github.com/native-html/plugins/compare/@native-html/table-plugin@4.0.0...@native-html/table-plugin@4.0.1) (2021-02-07)


### Bug Fixes

* **table-plugin:** default htmlAttribs would cause infinite re-renders ([cb23e01](https://github.com/native-html/plugins/commit/cb23e01d50af19374686632b51d47aa4bd6f532b))
* **table-plugin:** pass anchor attributes and target to `onLinkPress` ([0e45cde](https://github.com/native-html/plugins/commit/0e45cde4be33ccc17f86056800356ad3c0dd2b70))
* **table-plugin:** upgrade webshell to v2.3.0 fixing potential infinite re-renders ([ffd8343](https://github.com/native-html/plugins/commit/ffd8343743d6dec64a1081a09f5a86b06a1e8784))

# [4.0.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@3.1.0...@native-html/table-plugin@4.0.0) (2021-02-06)


### Bug Fixes

* **table-plugin:** mark displayMode field as optional ([b395a49](https://github.com/native-html/plugins/commit/b395a49f0e5d439a799a84393e2c8fd50a239c2c))


### Features

* **table-plugin:** support react-native-render-html 6.x ([1526efe](https://github.com/native-html/plugins/commit/1526efe18b8fd67a51235dca341b34c7227dafa3))


### BREAKING CHANGES

* **table-plugin:** - `extractHtmlTableProps` has been dropped in favor of
`useHtmlTableProps` hook for reusability.
- `IGNORED_TAGS` is not exported anymore, and not necessary.
- requires `react-native` 0.63.x and above
- new `tableModel` export for the new custom renderers API

# [3.1.0](https://github.com/native-html/plugins/compare/@native-html/table-plugin@3.0.1...@native-html/table-plugin@3.1.0) (2020-12-05)


### Features

* **table-plugin:** add new `tableConfig` argument to extractHtmlTableProps ([366c156](https://github.com/native-html/plugins/commit/366c15625d76b75799387ed7a41fa0fb504fe5e0))
* **table-plugin:** new `displayMode` value, "embedded" ([0ec4937](https://github.com/native-html/plugins/commit/0ec49370dc29b54572d2c03b638d7568c1d5bd7d))

## [3.0.1](https://github.com/native-html/plugins/compare/@native-html/table-plugin@3.0.0...@native-html/table-plugin@3.0.1) (2020-12-05)

## Misc

- Rework version range for react-native-render-html

# 3.0.0 (2020-12-05)

This release requires `react-native-render-html` ≥ 5.0.0! Be aware, its API has changed a little:


```javascript
import React from 'react';
import { ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import table, { IGNORED_TAGS } from '@native-html/table-plugin';
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
    table
  },
  ignoredTags: IGNORED_TAGS,
  renderersProps: {
    table: {
      // Put the table config here (previously,
      // the first argument of makeTableRenderer)
    }
  }
};

export const Example = () => (
  <ScrollView>
    <HTML source={{ html }} {...htmlProps} />
  </ScrollView>
);
```

### Features

* **table-plugin:** new lightweight API for react-native-render-html v5.0 ([a7fa70a](https://github.com/native-html/plugins/commit/a7fa70aa36d7a5f3b1d3a6dcc44e3358af321f52))
* **table-plugin:** new displayMode prop and compliance with RFC001 ([1de3df0](https://github.com/native-html/plugins/commit/1de3df06ac5a81b70f544c3fcbf3d735dea95de7))
* **table-plugin:** the component now inherits from `tagsStyles` and `classesStyles` when matched

### BREAKING CHANGES

* **table-plugin:** `makeTableRenderer` and `makeCustomTableRenderer` have
been dropped in favor of the default `table` renderer export and
`extractHtmlTableProp` function for custom renderers. This release takes
advantage of the availability of `domNode` in custom renderers and the
new `domNodeToHTMLString` utility available in react-native-render-html.
Configuration for the table renderer is now read from
`renderersProps.table` prop of the `HTML` component.

## [2.1.4](https://github.com/native-html/table-plugin/compare/v2.1.3...v2.1.4) (2020-10-08)

### Misc

- Ornamental changes (README)

## [2.1.3](https://github.com/native-html/table-plugin/compare/v2.1.2...v2.1.3) (2020-10-08)

### Misc

- Ornamental changes (README)

## [2.1.2](https://github.com/native-html/table-plugin/compare/v2.1.1...v2.1.2) (2020-10-08)

### Enhancements

- Add README.MD in bundle

## [2.1.1](https://github.com/native-html/table-plugin/compare/v2.1.0...v2.1.1) (2020-10-08)

### Dependencies

* Upgrade @formidable-webview/* dependencies

# [2.1.0](https://github.com/native-html/table-plugin/compare/v2.0.1...v2.1.0) (2020-10-03)

### Features

* add `TableConfig.maxScale` option to allow zooming in tables ([6338296](https://github.com/native-html/table-plugin/commit/63382966073e07a250ad72ea483f71b0e5516913))

## [2.0.1](https://github.com/native-html/table-plugin/compare/v2.0.0...v2.0.1) (2020-10-01)

### Dependencies

* Upgrade `@formidable-webview/webshell` ([ef53677](https://github.com/native-html/table-plugin/commit/ef5367728c7ac7fb7babe7018b96ed46a8ba5b66)).

# [2.0.0](https://github.com/native-html/table-plugin/compare/v1.0.4...v2.0.0) (2020-09-28)


### Code Refactoring

* implement HTMLTable component with [**webshell 2.0**](https://formidable-webview.github.io/webshell/) `useAutoheight` ([0d038ba](https://github.com/native-html/table-plugin/commit/0d038ba0f61cfa2cd9f089ed7d69d26d191cd4a6)), closes [#16](https://github.com/native-html/table-plugin/issues/16)


### Features

* better customizability of table style specs ([2b66c10](https://github.com/native-html/table-plugin/commit/2b66c10a61990de4a7beb735be0e5be9121c985b)), thanks [@nadav2051](https://github.com/nadav2051)! closes [#10](https://github.com/native-html/table-plugin/issues/10)


### Performance Improvements

* avoid rerendering caused by `onDOMLinkPress` ([1fe9f77](https://github.com/native-html/table-plugin/commit/1fe9f7748851d92935f9fcc7693b5be02f79bfc6))
* limit number of rendering cycles ([312e648](https://github.com/native-html/table-plugin/commit/312e648b8fb7eddd8c933d6e0b1ba8e35457a910))


### BREAKING CHANGES

* removed `TableStyleSpecs.borderWidthPx` in favor of
`rowsBorderWidthPx`, `columnsBorderWidthPx` and `outerBorderWidthPx`
* This plugin now **requires React Native 0.59+** because it uses hooks internally.

## [1.0.4](https://github.com/native-html/table-plugin/compare/v1.0.3...v1.0.4) (2020-08-20)

## [1.0.3](https://github.com/native-html/table-plugin/compare/v1.0.2...v1.0.3) (2020-08-20)


### Bug Fixes

* **deps:** move metro-react-native-babel-transformer to devDependencies ([c64e4c0](https://github.com/native-html/table-plugin/commit/c64e4c05e60347e4d403da3f2711cbeb684d6e78))

## [1.0.2](https://github.com/native-html/table-plugin/compare/v1.0.0...v1.0.2) (2020-08-19)

### Chore

Fix misconfigured repository field in package.json, responsible for bad relative links resolutions in npmjs and changelog generators.

# [1.0.0](https://github.com/native-html/table-plugin/compare/v0.6.1...v1.0.0) (2020-08-19)

### Code Refactoring

* restructure source files and comply with api-extractor ([644e2ff](https://github.com/native-html/table-plugin/commit/644e2ff653d5abff979a72ea6cee733227b0baf6))


### Features

* new TableConfig API to configure height computation ([07264fb](https://github.com/native-html/table-plugin/commit/07264fb6233d47cb23ce559c54b83c983e778021))


### BREAKING CHANGES

* `WebViewComponent` config field has been renamed to `WebView`.
* `autoheight`, `maxHeight` and `defaultHeight` have been
dropped in favour of `computeContainerHeight`. This function gives more
flexibility to library users, providing a way to set height at different
steps of the component lifecycle. Also, `useLayoutAnimation` has been
dropped in favour of `animationType`, giving the opportunity to completely
switch off animations. Moreover, a new prop, `computeHeuristicContentHeight`,
allows even more fine-grain control on the height computation logic and
more specifically, when the accurate content height is not yet available.
Finally, `animationDuration` now replaces `transitionDuration` to make the
semantic link with animationType more explicit.
* remove export of domToHTML


## [0.6.1](https://github.com/native-html/table-plugin/compare/v0.6.0...v0.6.1) (2020-07-03)


### Bug Fixes

* merge default table style specs to user-provided `tableStyleSpecs` ([f2b9d82](https://github.com/native-html/table-plugin/commit/f2b9d82c8d5f3019e95a872e4e24d3e8052a0a0d))

# [0.6.0](https://github.com/native-html/table-plugin/compare/v0.5.1...v0.6.0) (2020-07-03)


### Bug Fixes

* empty 'cssRules' prop is ignored ([469ec9a](https://github.com/native-html/table-plugin/commit/469ec9a0665735e64790df9f3724a8411fbe1d83))
* script injection resulting in syntax error ([875f18f](https://github.com/native-html/table-plugin/commit/875f18f2f24cdc1db6ee79a9487495ecddd92d15))
* table borders correctly rendered left and bottom ([14422f8](https://github.com/native-html/table-plugin/commit/14422f84cbe2c4e89315119624cd2cc6aeb46198))


### Features

* fontSizePx attribute in tableStyleSpecs ([104bcab](https://github.com/native-html/table-plugin/commit/104bcab4bbcb2ffe56f41b87cdc743170dc72614))
* split fitContainer prop in fitContainerHeight and fitContainerWidth ([2bdb077](https://github.com/native-html/table-plugin/commit/2bdb0779fd31ca8ef3021938545bed7ca2e77fa6))

## BREAKING CHANGES

- `fitContainer` attribute of `tableStyleSpecs` config has been split into `fitContainerWidth` and `fitContainerHeight`.
- TypeScript definitions for `react-native-render-html` are not embedded anymore. Please upgrade to `react-native-render-html@4.2.1`.


## 0.5.3

- restrict `react-native-render-html` peer version

## 0.5.2

- add `renderersProps` to `HTMLTable` and custom tables.

## [0.5.1](https://github.com/native-html/table-plugin/compare/v0.4.0...v0.5.1) (2019-11-20)

* include table border attribute when computing table's height ([5fe4a94](https://github.com/native-html/table-plugin/commit/5fe4a94d8489e33575ea64bc94b6f2a738e12d6a)), closes [#8](https://github.com/native-html/table-plugin/issues/8)

## 0.5.0

* rename `androidSourceBaseUrl` prop to `sourceBaseUrl` ([692190e](https://github.com/native-html/table-plugin/commit/692190ea440faa75b4c33bbc66a9d2d0cd1cdcdc))

### BREAKING CHANGES

* rename `androidSourceBaseUrl` prop to `sourceBaseUrl`.

## 0.4.1

- Fix HTML.onLinkPress does not get fired if link contains html elements, [#5](https://github.com/jsamr/react-native-render-html-table-bridge/issues/5)
- Use const TABLE_TAGS for IGNORED_TAGS, [#1](https://github.com/jsamr/react-native-render-html-table-bridge/pull/1) by @donni106

## 0.4.0

- Get rid of deprecated `componentWillUpdate` method in `HTMLTable` component;
- Fix inconsistent odd/even rules;
- Run injected javascript in a closure, [#4](https://github.com/jsamr/react-native-render-html-table-bridge/issues/4);
- Add new TableStyleSpecs properties:
    - Add cellPaddingEm, borderWidthPx, thOddBackground, thOddColor;
    - **BREAKING** remove thBackground and thColor;
    - Add thEvenBackground and thEvenColor.

## 0.3.1

- Add `selectableText` field in `tableStyleSpecs` config option;
- Export `cssRulesFromSpecs` and `defaultTableStylesSpecs`;
- Add FAQ to readme;
- Added `numOfRows`, `numOfColumns` and `numOfChars` to `HTMLTable` props, which can help trigger rendering logic depending on table stats;
- Export `makeCustomTableRenderer` to customize table component;
- Added a new example with custom complex table.
