const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = {
  //mode: 'production'
  configureWebpack: {
    entry: {
      app: './src/renderer/main.js'
    },
    resolve: {
      alias: {
        main: path.join(__dirname, 'src/main'),
        '@': path.join(__dirname, 'src/renderer')
      }
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['markdown'],
        output: './js/monaco-editor'
      })
    ]
  },
  css: {
    loaderOptions: {
      // 全局stylus变量
      stylus: {
        import: '~@/assets/css/imports.styl'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        mac: {
          icon: 'public/icons/mac/icon.icns'
        },
        win: {
          icon: 'public/icons/win/icon.ico'
        },
        linux: {
          icon: 'public/icons/mac/icon.icns'
        }
      },
      externals: ['sqlite3'],
      mainProcessFile: 'src/main/main.js',
      mainProcessWatch: ['src/main'],
      // [1.0.0-rc.4+] Provide a list of arguments that Electron will be launched with during "electron:serve",
      // which can be accessed from the main process (src/background.js).
      // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
      mainProcessArgs: []
    }
  }
}
