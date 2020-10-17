const path = require('path')

module.exports = {
  //mode: 'production'
  configureWebpack: {
    entry: {
      app: './src/renderer/main.js',
    },
    resolve: {
      alias: {
        main: path.join(__dirname, 'src/main'),
        '@': path.join(__dirname, 'src/renderer'),
      },
    },
    plugins: [],
  },

  pluginOptions: {
    electronBuilder: {
      customFileProtocol: './',
      nodeIntegration: true,
      builderOptions: {
        productName: 'Markman',
        appId: 'com.xemxx.markman',
        publish: [
          {
            provider: 'github',
            owner: 'xemxx',
            repo: 'markman-client',
            releaseType: 'draft',
          },
        ],
        mac: {
          target: ['dmg', 'zip'],
          icon: 'public/icons/mac/icon.icns',
        },
        win: {
          target: ['nsis'],
          icon: 'public/icons/win/icon.ico',
        },
        linux: {
          target: ['AppImage', 'deb'],
          icon: 'public/icons/mac/icon.icns',
        },
      },
      externals: ['sqlite3'],
      mainProcessFile: 'src/main/main.js',
      // mainProcessWatch: ['src/main'],
      mainProcessArgs: [],
    },
  },

  productionSourceMap: false,
}
