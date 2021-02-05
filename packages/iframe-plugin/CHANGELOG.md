## [1.1.1](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@1.1.0...@native-html/iframe-plugin@1.1.1) (2020-12-05)


### Bug Fixes

* **iframe-plugin:** resolve TypeError when renderersProp is not defined ([54e650b](https://github.com/native-html/plugins/commit/54e650b9046aeae12f63ed94c41d19347e97d725))

# [1.1.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@1.0.0...@native-html/iframe-plugin@1.1.0) (2020-12-05)


### Features

* **iframe-config:** new config option `webViewProps` ([b7d16f8](https://github.com/native-html/plugins/commit/b7d16f80d6fd110bc09889a4767e10c43fdec401))
* **iframe-plugin:** allow to override config in extractHtmlIframeProps ([ee25f4b](https://github.com/native-html/plugins/commit/ee25f4b8fa5e819d22ddcb01e0d24ae8ec8f6712))

# 1.0.0 (2020-12-05)

Here comes a brand new renderer for `iframe`, which has been extracted from
`react-native-render-html`. It has a new powerful feature: `scalesPageToFit`
(disabled by default) which will zoom-out just the right amount when the width
of the iframe is greater than the available width on screen (as determined by
HTML `contentWidth` prop.) In the screenshot below, scalesPageToFit is disabled
(left), and enabled (right):

![](https://github.com/native-html/plugins/blob/master/images/scalesPageToFit.jpg)

### Features

* **iframe-plugin:** brand new iframe renderer ([b08d56d](https://github.com/native-html/plugins/commit/b08d56d4b39914a15dffb556ab01528b24360365))
* **iframe-plugin:** new scalesPageToFit config ([8f5c030](https://github.com/native-html/plugins/commit/8f5c030e7080d2ee861cbbc7db49d214529679f6))
* **iframe-plugin:** the component inherits from `tagsStyles` and `classesStyles` styles when matched
* **iframe-plugin:** compliance with React Native Render HTML RFC001: use `computeEmbeddedMaxWidth` to constrain max width for iframes

