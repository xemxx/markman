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

  css: {
    loaderOptions: {
      stylus: {
        import: '~@/assets/css/imports.styl',
      },
    },
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
      mainProcessWatch: ['src/main'],
      // [1.0.0-rc.4+] Provide a list of arguments that Electron will be launched with during "electron:serve",
      // which can be accessed from the main process (src/background.js).
      // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
      mainProcessArgs: [],
    },
  },

  productionSourceMap: false,
}
