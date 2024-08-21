import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { initDB } from '@/plugins/sqlite3/index'
import 'ant-design-vue/dist/reset.css'
import '@/assets/css/index.styl'
import 'virtual:svg-icons-register'
import pinia from '@/store'
import { useUserStore } from '@/store/user'

initDB()

const app = createApp(App)

app
  .use(router)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

router.beforeEach((to, _, next) => {
  const user = useUserStore()
  if (to.matched.some(m => m.meta.auth)) {
    if (user.token === '') {
      next({
        path: '/sign/in',
      })
      return
    }
  }
  next()
})
