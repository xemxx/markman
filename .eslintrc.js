const path = require('path')
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: 'vue-eslint-parser',
  globals: {
    __static: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      // Allows for the parsing of JSX
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },

  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['main', path.join(__dirname, 'electron/main')],
          ['@', path.join(__dirname, 'src')],
        ],
        extensions: ['.ts', '.js', '.vue', '.json', '.css', '.node'],
      },
    },
  },
  extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
}
