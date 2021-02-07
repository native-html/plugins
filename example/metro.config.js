const path = require('path');

const commonModulePath = path.resolve(__dirname, '../packages');

module.exports = {
  projectRoot: __dirname,
  watchFolders: [commonModulePath],
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
        inlineRequires: true
      }
    })
  }
};
