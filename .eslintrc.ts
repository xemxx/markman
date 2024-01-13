import { join } from 'path'
export const root = true
export const env = {
  node: true,
  es6: true,
}
export const parser = 'vue-eslint-parser'
export const parserOptions = {
  parser: '@typescript-eslint/parser',
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: {
    // Allows for the parsing of JSX
    jsx: true,
  },
}
export const rules = {
  '@typescript-eslint/no-explicit-any': 'off',
  'vue/multi-word-component-names': 'off',
}
export const settings = {
  'import/resolver': {
    alias: {
      map: [
        ['main', join(__dirname, 'electron/main')],
        ['@', join(__dirname, 'src')],
      ],
      extensions: ['.ts', '.js', '.vue', '.json', '.css', '.node'],
    },
  },
}
// export const extends = ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended']
