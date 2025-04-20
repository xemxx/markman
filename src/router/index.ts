import { createRouter, createWebHashHistory } from 'vue-router'
import Base from '@/views/EditorBase.vue'
import Login from '@/views/Login.vue'
import Preference from '@/views/Preference.vue'
import General from '@/components/preference/general.vue'
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
      {
        path: 'sync',
        component: () => import('@/components/preference/sync.vue'),
        name: 'sync',
      },
      {
        path: 'image',
        component: () => import('@/components/preference/image.vue'),
        name: 'image',
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
