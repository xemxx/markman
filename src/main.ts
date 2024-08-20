import { createApp } from 'vue'
import App from './App.vue'

import router from '@/router'

import { initDB } from '@/plugins/sqlite3/index'
import 'ant-design-vue/dist/reset.css'
import '@/assets/css/index.styl'

import 'virtual:svg-icons-register'

import pinia from '@/store'

initDB()

const app = createApp(App)

app
  .use(router)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

import { useUserStore } from '@/store/user'

const user = useUserStore()

router.beforeEach((to, _, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    if (user.token === '') {
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
