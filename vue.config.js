const path = require("path");
module.exports = {
  //mode: 'production'
  configureWebpack: {
    resolve: {
      alias: {
        main: path.join(__dirname, "../src/main"),
        //"@": path.join(__dirname, "../src/renderer"),
        common: path.join(__dirname, "../src/common")
      }
    }
  },
  css: {
    loaderOptions: {
      // 全局stylus变量
      stylus: {
        import: "~@/assets/css/imports.styl"
      }
    }
  }
};
