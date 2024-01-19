import { ipcRenderer } from 'electron'
import { defineStore } from 'pinia'

// user preference
const state = {
  autoSave: false,
  autoSaveDelay: 1000,
  // menu status
  toggleSidebar: false,
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

    getLocal() {
      ipcRenderer.send('m::get-user-pref')

      ipcRenderer.on('m::user-pref', (_, preferences) => {
        this.SET_PREFERENCE(preferences)
      })
    },
    // eslint-disable-next-line no-empty-pattern
    setOne({ type, value }) {
      // save to electron-store
      ipcRenderer.send('m::set-user-pref', { [type]: value })
    },
  },
})
