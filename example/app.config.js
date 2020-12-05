const pluginVersion = require('@native-html/table-plugin/package.json').version;

export default {
  name: 'RNPluginsExamples',
  displayName: '@native-html/plugins Examples',
  expo: {
    name: 'Plugins Examples',
    slug: 'native-html-plugins-examples',
    version: pluginVersion,
    orientation: 'default',
    icon: './assets/icon.png',
    splash: {
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    web: {
      favicon: './assets/favicon.png'
    }
  }
};
