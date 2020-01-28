import VueRouter from 'vue-router'
import Index from '../views/Index.vue'
import Home from '../views/Home.vue'
import Sign from '../views/Sign.vue'
import SignUp from '../components/sign/SignUp.vue'
import SignIn from '../components/sign/SignIn.vue'

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
    path: '/',
    name: 'Index',
    component: Index,
    meta: { auth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { auth: true }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
