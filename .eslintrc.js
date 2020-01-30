module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    __static: true,
    BigInt: true
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['common', './src/common']
          // Normally only valid for renderer/
          // ["@", "./src/renderer"],
        ],
        extensions: ['.js', '.vue', '.json', '.css', '.node']
      }
    }
  }
}
