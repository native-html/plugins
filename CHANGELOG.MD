## [2.1.3](https://github.com/native-html/table-plugin/compare/v2.1.2...v2.1.3) (2020-10-08)

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
