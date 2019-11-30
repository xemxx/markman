import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '../views/Editor.vue'
import Sign from '../views/Sign.vue'
import SignUp from '../components/sign/SignUp.vue'
import SignIn from '../components/sign/SignIn.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Sign,
    children: [
      {
        path: '',
        component: SignIn
      },
      {
        path: 'signin',
        component: SignIn
      },
      {
        path: 'signup',
        component: SignUp
      }
    ]
  },
  {
    path: '/Editor',
    name: 'editor',
    component: Editor,
    meta: { auth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
