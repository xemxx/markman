import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/views/App.vue'
import Base from '@/views/EditorBase.vue'
import Sign from '@/views/Sign.vue'
import Preference from '@/views/Preference.vue'
import SignUp from '@/components/sign/signUp.vue'
import SignIn from '@/components/sign/signIn.vue'
import General from '@/preferences/general.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: '/editorBase',
        name: 'editorBase',
        component: Base,
        meta: { auth: true },
      },
      {
        path: '/sign',
        component: Sign,
        children: [
          {
            path: 'in',
            name: 'signin',
            component: SignIn,
          },
          {
            path: 'up',
            name: 'signup',
            component: SignUp,
          },
        ],
      },
    ],
  },

  {
    path: '/preference',
    component: Preference,
    children: [
      {
        path: '',
        component: General,
      },
      {
        path: 'general',
        component: General,
        name: 'general',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

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

export default router
