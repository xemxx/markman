import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './plugins/viewui.js'
import './plugins/sqlite3/db.js'
Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    if (store.state.login.token === '') {
      next({ path: '/sing/login' });
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
}).$mount('#app')
