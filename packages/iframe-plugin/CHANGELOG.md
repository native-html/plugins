# 1.0.0 (2020-12-05)


### Features

* **iframe-plugin:** brand new iframe renderer ([b08d56d](https://github.com/native-html/plugins/commit/b08d56d4b39914a15dffb556ab01528b24360365))
* **iframe-plugin:** new autoscale config ([8f5c030](https://github.com/native-html/plugins/commit/8f5c030e7080d2ee861cbbc7db49d214529679f6))
* **table-plugin:** new lightweight API for react-native-render-html v5.0 ([a7fa70a](https://github.com/native-html/plugins/commit/a7fa70aa36d7a5f3b1d3a6dcc44e3358af321f52))


### BREAKING CHANGES

* **table-plugin:** `makeTableRenderer` and `makeCustomTableRenderer` have
been dropped in favor of the default `table` renderer export and
`extractHtmlTableProp` function for custom renderers. This release takes
advantage of the availability of `domNode` in custom renderers and the
new `domNodeToHTMLString` utility available in react-native-render-html.
Configuration for the table renderer is now read from
`renderersProps.table` prop of the `HTML` component.

