import { createApp } from 'vue'
import App from './App.vue'

import router from '@/router'

import devtools from '@vue/devtools'
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  devtools.connect()
}

import '@/plugins/sqlite3/init'
import '@/assets/css/index.styl'

import 'virtual:svg-icons-register'

import pinia from '@/store'

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

router.beforeEach((to, from, next) => {
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
