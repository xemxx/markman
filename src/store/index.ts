import { createStore, Store } from 'vuex'

let modules = {}
// Vite 支持 Glob 导入 https://vitejs.cn/guide/features.html#glob-%E5%AF%BC%E5%85%A5
// 导入 modules 下面的 所有 .ts文件
const modulesFiles = import.meta.globEager('./modules/*.(js|ts)')
for (const path in modulesFiles) {
  const moduleName = path.replace(/(.*\/)*([^.]+).*/gi, '$2')
  modules = { ...modules, [moduleName]: modulesFiles[path].default }
}

export interface State {
  online: Boolean
  platform: string | undefined
}

const store = createStore<State>({
  state: {
    online: navigator.onLine,
    platform: process.env.platform,
  },
  mutations: {
    update_online(state, value) {
      state.online = value
    },
  },
  modules,
})

//添加对联网状态的更新
window.addEventListener('online', () => store.commit('update_online', true))
window.addEventListener('offline', () => store.commit('update_online', false))

export default store
