import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia, { useSidebarStore } from '@/store'
import { useUserStore, usePreferenceStore } from '@/store'
import { initializeApp } from '@/services/appInitService'

import './assets/index.css'

const app = createApp(App)

app
  .use(pinia)
  .use(router)
  .directive('focus', {
    mounted(el) {
      el.focus()
    },
  })

const user = useUserStore()

router.beforeEach((to, _from, next) => {
  // 只检查用户是否已鉴权
  if (to.matched.some(m => m.meta.auth)) {
    if (!user.isLogin) {
      // 用户未登录，根据是否有服务器地址决定跳转到登录页还是设置页
      if (user.server === '') {
        next({
          path: '/login-setting',
        })
        return
      }
      next({
        path: '/login',
      })
      return
    }
  }
  next()
})

// 初始化应用（获取用户信息等）
await initializeApp()

if (!user.isLogin) {
  await router.replace(user.server === '' ? '/login-setting' : '/login')
}

const sidebar = useSidebarStore()
await sidebar.loadNodeTree()
const preference = usePreferenceStore()
await preference.initListen()

await router.isReady()

app.mount('#app').$nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
