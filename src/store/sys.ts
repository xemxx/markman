import { defineStore } from 'pinia'

export const useSysStore = defineStore('sys', {
  state: () => ({
    online: navigator.onLine,
    platform: process.env.platform,
  }),
  actions: {
    update_online(value) {
      this.online = value
    },
  },
})

//添加对联网状态的更新
window.addEventListener('online', () => useSysStore().update_online(true))
window.addEventListener('offline', () => useSysStore().update_online(false))
