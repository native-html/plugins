const tsPlugin = require('@typescript-eslint/eslint-plugin');
const compat = require('eslint-plugin-compat');
const tsdoc = require('eslint-plugin-tsdoc');
const prettier = require('eslint-config-prettier');
const espree = require('espree');
const globals = require('globals');

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
  },
  {
    files: ['**/*.webjs'],
    plugins: { compat },
    languageOptions: {
      parser: espree,
      ecmaVersion: 5,
      sourceType: 'script',
      globals: globals.browser
    },
    rules: {
      'no-unused-vars': 0,
      'strict': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': 'off',
      'dot-notation': 'off',
      'compat/compat': ['error', 'Android >= 4.1, iOS >= 7.0']
    }
  }
];
