import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./plugins/viewui.js";
import "./plugins/sqlite3/init.js";
import "./plugins/axios.js";

//import "./assets/styles/index.css";
//import "./assets/styles/printService.css";

Vue.config.productionTip = false;

// 全局拦截，检测token
router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    if (store.state.user.token === "") {
      next({ path: "/sign/in" });
    } else {
      next();
    }
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
