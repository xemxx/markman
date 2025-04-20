import { ipcRenderer } from 'electron'
import { defineStore } from 'pinia'

// user preference
const state = {
  autoSave: false,
  autoSaveDelay: 1000,
  // menu status
  toggleSidebar: false,
  nativeBar: true,
  // theme
  themeType: 'light',
  // sync
  autoSync: true,
  syncInterval: 60000, // 默认同步间隔：1分钟
}

export const usePreferenceStore = defineStore('preference', {
  state: () => state,
  actions: {
    SET_PREFERENCE(preference) {
      Object.keys(preference).forEach(key => {
        if (
          typeof preference[key] !== 'undefined' &&
          typeof this[key] !== 'undefined'
        ) {
          this[key] = preference[key]
        }
      })
    },
    SET_MODE({ type, checked }) {
      this[type] = checked
    },
    TOGGLE_VIEW_MODE(entryName) {
      this[entryName] = !this[entryName]
    },

    async initListen() {
      ipcRenderer.on('m::user-pref', (_, preferences) => {
        this.SET_PREFERENCE(preferences)
      })
      const p = await ipcRenderer.invoke('m::get-user-pref')
      this.SET_PREFERENCE(p)
      this.$subscribe((mutation, state) => {
        Object.keys(state).forEach(key => {
          if (
            typeof state[key] !== 'undefined' &&
            typeof this[key] !== 'undefined'
          ) {
            // 每当状态发生变化时，将整个 state 同步到其他窗口
            this.setOne({ type: key, value: state[key] })
          }
        })
      })
    },

    destroyListen() {
      ipcRenderer.removeAllListeners('m::user-pref')
    },

    // eslint-disable-next-line no-empty-pattern
    setOne({ type, value }) {
      // save to electron-store
      ipcRenderer.send('m::set-user-pref', { [type]: value })
    },
    // eslint-disable-next-line no-empty-pattern
    async getOne(key: string) {
      // save to electron-store
      return await ipcRenderer.invoke('m::get-user-pref-one', { key })
    },
  },
})
