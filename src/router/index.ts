import { createRouter, createWebHashHistory } from 'vue-router'
import Base from '@/views/EditorBase.vue'
import Login from '@/views/Login.vue'
// import Register from '@/views/Register.vue'
import Preference from '@/views/Preference.vue'
import General from '@/preferences/general.vue'
import LoginSetting from '@/views/LoginSetting.vue'

const routes = [
  {
    path: '/editorBase',
    name: 'editorBase',
    component: Base,
    meta: { auth: true },
  },
  {
    path: '/login-setting',
    component: LoginSetting,
  },
  {
    path: '/login',
    component: Login,
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
