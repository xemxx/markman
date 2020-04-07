import VueRouter from 'vue-router'
import Vue from 'vue'
import Main from '@/views/Main'
import Loding from '@/views/Loding'
import Editor from '@/views/Editor.vue'
import Sign from '@/views/Sign.vue'
import Preference from '@/views/Preference.vue'
import SignUp from '@/components/sign/SignUp.vue'
import SignIn from '@/components/sign/SignIn.vue'
import General from '@/preferences/General'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '',
        component: Loding
      },
      {
        path: '/editor',
        name: 'editor',
        component: Editor,
        meta: { auth: true }
      },
      {
        path: '/sign',
        component: Sign,
        children: [
          {
            path: 'in',
            name: 'signin',
            component: SignIn
          },
          {
            path: 'up',
            name: 'signup',
            component: SignUp
          }
        ]
      }
    ]
  },

  {
    path: '/preference',
    component: Preference,
    children: [
      {
        path: '',
        component: General
      },
      {
        path: 'general',
        component: General,
        name: 'general'
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
