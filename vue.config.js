const path = require("path");
module.exports = {
  //mode: 'production'
  configureWebpack: {
    resolve: {
      alias: {
        main: path.join(__dirname, "src/main")
        //"@": path.join(__dirname, "../src/renderer"),
        // common: path.join(__dirname, "src/common"),
        // muya: path.join(__dirname, "src/muya")
        // snapsvg: path.join(
        //   __dirname,
        //   "../src/muya/lib/assets/libs/snap.svg-min.js"
        // )
      }
    }
  }
};
