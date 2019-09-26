# Changelog

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
