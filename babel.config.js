module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 10
        }
      }
    ]
  ],
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]]
}
