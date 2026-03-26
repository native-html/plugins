/* eslint-disable @typescript-eslint/no-require-imports */
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const compat = require('eslint-plugin-compat');
const tsdoc = require('eslint-plugin-tsdoc');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...tsPlugin.configs['flat/recommended'],
  compat.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { tsdoc },
    rules: {
      ...prettier.rules,
      'comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
      ]
    }
  }
];
