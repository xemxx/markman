import VueRouter from 'vue-router'
import Vue from 'vue'
import Editor from '@/views/Editor.vue'
import Sign from '@/views/Sign.vue'
import Preference from '@/views/Preference.vue'
import SignUp from '@/components/sign/SignUp.vue'
import SignIn from '@/components/sign/SignIn.vue'
import General from '@/preferences/General'

Vue.use(VueRouter)

const routes = [
  {
    path: '/sign',
    component: Sign,
    children: [
      {
        path: 'in',
        component: SignIn
      },
      {
        path: 'up',
        component: SignUp
      }
    ]
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor,
    meta: { auth: true }
  },
  {
    path: '/preference',
    name: 'Preference',
    component: Preference,
    children: [
      {
        path: '',
        component: General
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
