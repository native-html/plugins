# [2.6.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.5.0...@native-html/iframe-plugin@2.6.0) (2021-10-13)


### Bug Fixes

* **iframe-plugin:** the iframe is painted as a blank view ([d40e98d](https://github.com/native-html/plugins/commit/d40e98db2595c3d8a231b0070ca3e74d6562fc83)), closes [#41](https://github.com/native-html/plugins/issues/41)
* remove null from useHtmlIframeProps return signature (dead condition) ([4c51d0a](https://github.com/native-html/plugins/commit/4c51d0af641c0fd121d3959febcc60c09c8259b5))


### Features

* **iframe-plugin:** support headers via `provideEmbeddedHeaders` prop ([436a2ac](https://github.com/native-html/plugins/commit/436a2ace0afc80eb1cdba463c06985fc3acee6f8))

# [2.5.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.4.0...@native-html/iframe-plugin@2.5.0) (2021-06-08)


### Features

* **iframe:** support react-native-render-html@6.0.0-beta.0 ([96c33b5](https://github.com/native-html/plugins/commit/96c33b56ad24a98f76142aad46007d7fbb28699f))

# [2.4.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.3.0...@native-html/iframe-plugin@2.4.0) (2021-05-21)


### Bug Fixes

* **iframe:** did not pick config passed in rendererProps ([3580d77](https://github.com/native-html/plugins/commit/3580d7781c75ed0a5f3707d5b2fe18c0d8fe6926))


### Features

* support react-native-render-html@6.0.0-alpha.25; beware of upstream breaking changes ([53e322c](https://github.com/native-html/plugins/commit/53e322cad64aece27d5c95c1bc9fb4a3095addbd))

# [2.3.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.2.2...@native-html/iframe-plugin@2.3.0) (2021-04-17)


### Features

* **iframe-plugin:** support react-native-render-html@6.0.0-alpha.23 ([489f8f4](https://github.com/native-html/plugins/commit/489f8f4fec58281a2cb1b4180f886a97bddc00d3))

## [2.2.2](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.2.1...@native-html/iframe-plugin@2.2.2) (2021-04-17)


### Bug Fixes

* restrict to react-native-render-html < 6.0.0-alpha.23 ([3a8d9f8](https://github.com/native-html/plugins/commit/3a8d9f8fada412d5adae663338b4661a20b19be3))

## [2.2.1](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.2.0...@native-html/iframe-plugin@2.2.1) (2021-04-17)


### Bug Fixes

* restrict compatible versions of react-native-render-html ([032c4ed](https://github.com/native-html/plugins/commit/032c4ed035150471c914d6406fe7b2b2237035fe))

# [2.2.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.1.1...@native-html/iframe-plugin@2.2.0) (2021-02-19)


### Bug Fixes

* force responsive layout when scalesPageToFit = false (1:1) ([1233104](https://github.com/native-html/plugins/commit/12331044fd9f21e443086ca7bd50d37c3ceaa8eb))


### Features

* **iframe:** new `removeBodySpacing` and `injectedCSSStyles` options ([2166dc6](https://github.com/native-html/plugins/commit/2166dc6139065d19a8d1bf914f9bad055c59389b))

## [2.1.1](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.1.0...@native-html/iframe-plugin@2.1.1) (2021-02-18)


### Bug Fixes

* replace outdated type import `RenderHTMLPassedProps` ([872bc96](https://github.com/native-html/plugins/commit/872bc965d8b5c5e8e37430060a2edc343549623f))

# [2.1.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.0.2...@native-html/iframe-plugin@2.1.0) (2021-02-08)


### Features

* **iframe-plugin:** handle baseUrl for inline iframe source ([ac0d125](https://github.com/native-html/plugins/commit/ac0d125e0ba30aeadbb3314fab40c478b824ee99))
* **iframe-plugin:** support relative `src` URLs ([3f13d68](https://github.com/native-html/plugins/commit/3f13d684827242f169ff5e8f9e7dca3d1c92d823))

## [2.0.2](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.0.1...@native-html/iframe-plugin@2.0.2) (2021-02-07)

## [2.0.1](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@2.0.0...@native-html/iframe-plugin@2.0.1) (2021-02-07)


### Bug Fixes

* **iframe-plugin:** pass anchor attributes and target to `onLinkPress` ([a5c22e8](https://github.com/native-html/plugins/commit/a5c22e81f8cff0eba82c363ac453e7118a5e200d))
* **iframe-plugin:** upgrade webshell to v2.3.0 fixing potential infinite re-renders ([a3d9248](https://github.com/native-html/plugins/commit/a3d92486ecd75e30c48d18f14042ec435ca9678d))

# [2.0.0](https://github.com/native-html/plugins/compare/@native-html/iframe-plugin@1.1.1...@native-html/iframe-plugin@2.0.0) (2021-02-06)


### Features

* **iframe-plugin:** support react-native-render-html 6.x ([11a8ca0](https://github.com/native-html/plugins/commit/11a8ca04e2e864de145b9189cfb526fb345782ae))


### BREAKING CHANGES

* **iframe-plugin:** - `extractHtmlIframeProps` has been dropped in favor of
`useHtmlIframeProps` hook for reusability.
- requires `react-native` 0.63.x and above
- new `iframeModel` export for the new custom renderers API

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

