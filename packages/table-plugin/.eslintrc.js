module.exports = {
  root: false,
  extends: ['../../.eslintrc.js'],
  overrides: [
    {
      files: ['*.webjs'],
      extends: '@formidable-webview/eslint-config-webjs'
    }
  ]
};
