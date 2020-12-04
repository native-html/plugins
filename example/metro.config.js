const path = require('path');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve('../packages/table-plugin'),
    path.resolve('../packages/iframe-plugin')
  ],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => path.join(__dirname, `node_modules/${name}`)
      }
    )
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  }
};
