# Changelog

## v0.6.0

- Make each attribute of `tableStyleSpecs` optional.
- `tableStyleSpecs` new attribute `fontSizePx`.
- End injected script with a true statement to comply with RNWV.

**BREAKING** 

- `fitContainer` attribute of `tableStyleSpecs` config has been split into `fitContainerWidth` and `fitContainerHeight`.
- TypeScript definitions for `react-native-render-html` are not embedded anymore. Please upgrade to `react-native-render-html@4.2.1`.


## v0.5.3

- restrict `react-native-render-html` peer version

## v0.5.2

- add `renderersProps` to `HTMLTable` and custom tables.

## v0.5.1

- include table border attribute when computing table's height, fix [#8](https://github.com/jsamr/react-native-render-html-table-bridge/issues/8)

## v0.5.0

- rename `androidSourceBaseUrl` prop to `sourceBaseUrl`

**BREAKING** the prop will be used on Android and iOS.

## v0.4.1

- Fix HTML.onLinkPress does not get fired if link contains html elements, [#5](https://github.com/jsamr/react-native-render-html-table-bridge/issues/5)
- Use const TABLE_TAGS for IGNORED_TAGS, [#1](https://github.com/jsamr/react-native-render-html-table-bridge/pull/1) by @donni106

## v0.4.0

- Get rid of deprecated `componentWillUpdate` method in `HTMLTable` component;
- Fix inconsistent odd/even rules;
- Run injected javascript in a closure, [#4](https://github.com/jsamr/react-native-render-html-table-bridge/issues/4);
- Add new TableStyleSpecs properties:
    - Add cellPaddingEm, borderWidthPx, thOddBackground, thOddColor;
    - **BREAKING** remove thBackground and thColor;
    - Add thEvenBackground and thEvenColor.

## v0.3.1

- Add `selectableText` field in `tableStyleSpecs` config option;
- Export `cssRulesFromSpecs` and `defaultTableStylesSpecs`;
- Add FAQ to readme;
- Added `numOfRows`, `numOfColumns` and `numOfChars` to `HTMLTable` props, which can help trigger rendering logic depending on table stats;
- Export `makeCustomTableRenderer` to customize table component;
- Added a new example with custom complex table.
