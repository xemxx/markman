import { createApp } from 'vue'
import router from '@/router'
import store from '@/store'
import App from '@/App.vue'

import '@/plugins/sqlite3/init.js'
import Axios from '@/plugins/axios.js'
import Antd from '@/plugins/antd.js'
import '@/assets/css/index.styl'

// 全局拦截，检测token
router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    if (store.state.user.token === '') {
      next({
        path: '/sign/in',
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

const app = createApp(App)

app.config.productionTip = false
app.config.globalProperties.$axios = Axios

app.use(router).use(store).use(Antd).mount('#app')
