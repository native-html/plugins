# 1.0.0 (2020-12-05)

Here comes a brand new renderer for `iframe`, which has been extracted from
`react-native-render-html`. It has a new powerful feature: `autoscale` (enabled
by default) which will zoom-out just the right amount when the width of the
iframe is greater than the available width on screen (as determined by HTML
`contentWidth` prop.) In the screenshot below, autoscale is disabled (left), and enabled (right):

![](https://github.com/native-html/plugins/blob/master/images/autoscale.png)

### Features

* **iframe-plugin:** brand new iframe renderer ([b08d56d](https://github.com/native-html/plugins/commit/b08d56d4b39914a15dffb556ab01528b24360365))
* **iframe-plugin:** new autoscale config ([8f5c030](https://github.com/native-html/plugins/commit/8f5c030e7080d2ee861cbbc7db49d214529679f6))
* **iframe-plugin:** the component inherits from `tagsStyles` and `classesStyles` styles when matched
* **iframe-plugin:** compliance with React Native Render HTML RFC001: use `computeEmbeddedMaxWidth` to constrain max width for iframes

