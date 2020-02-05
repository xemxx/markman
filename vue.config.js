module.exports = {
  //mode: 'production'
  configureWebpack: {
    // resolve: {
    //   alias: {
    //     main: path.join(__dirname, '../src/main'),
    //     //"@": path.join(__dirname, "../src/renderer"),
    //     common: path.join(__dirname, '../src/common')
    //   }
    // }
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
