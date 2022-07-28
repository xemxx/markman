import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/views/App.vue'
import Base from '@/views/EditorBase.vue'
import Sign from '@/views/Sign.vue'
import Preference from '@/views/Preference.vue'
import SignUp from '@/components/sign/signUp.vue'
import SignIn from '@/components/sign/signIn.vue'
import General from '@/preferences/general.vue'

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

export default router

export const useRouter = () => {
  return router
}
