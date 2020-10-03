const pluginVersion = require('@native-html/table-plugin/package.json').version;

export default {
  name: 'RNTableExample',
  displayName: '@native-html/table-plugin Example',
  expo: {
    name: 'Table Example',
    slug: 'native-html-table-plugin-example',
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
