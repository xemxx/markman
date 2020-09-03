import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/views/App'
import Base from '@/views/Base'
import Sign from '@/views/Sign'
import Preference from '@/views/Preference'
import SignUp from '@/components/sign/signUp.vue'
import SignIn from '@/components/sign/signIn.vue'
import General from '@/preferences/General'

const routes = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: '/base',
        name: 'base',
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
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

export default router
