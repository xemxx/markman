const path = require('path')
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['plugin:vue/vue3-essential', '@vue/prettier'],
  globals: {
    __static: true,
  },
  rules: {
    //'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['main', path.join(__dirname, 'src/main')],
          ['@', path.join(__dirname, 'src/renderer')],
        ],
        extensions: ['.js', '.vue', '.json', '.css', '.node'],
      },
    },
  },
}
