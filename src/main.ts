import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { initDB } from '@/plugins/sqlite3/index'
import 'virtual:svg-icons-register'
import pinia from '@/store'
import { useUserStore } from '@/store/user'

import './assets/index.css'

initDB()

const app = createApp(App)

app
  .use(router)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

const user = useUserStore()

router.beforeEach((to, _, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    if (user.token === '') {
      next({
        path: '/login',
      })
      return
    }
  }
  next()
})

import { usePreferenceStore } from '@/store/preference'

const preference = usePreferenceStore()
preference.initListen()
