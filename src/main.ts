import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import pinia, { useSidebarStore } from '@/store'
import { useUserStore, usePreferenceStore } from '@/store'
import { initializeApp } from '@/services/appInitService'

import './assets/index.css'

const app = createApp(App)

app
  .use(router)
  .use(pinia)
  .directive('focus', {
    mounted(el) {
      el.focus()
    },
  })
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

const user = useUserStore()

// 初始化应用（获取用户信息等）
await initializeApp().then(async () => {
  if (!user.isLogin) {
    router.push('/login')
  }
  const sidebar = useSidebarStore()
  sidebar.loadNodeTree()
  const preference = usePreferenceStore()
  await preference.initListen()
})

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
