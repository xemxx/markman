import { ipcRenderer } from 'electron'

// user preference
const state = {
  autoSave: false,
  autoSaveDelay: 1000,
  // menu status
  toggleSidebar: false,
}

const mutations = {
  SET_PREFERENCE(state, preference) {
    Object.keys(preference).forEach(key => {
      if (
        typeof preference[key] !== 'undefined' &&
        typeof state[key] !== 'undefined'
      ) {
        state[key] = preference[key]
      }
    })
  },
  SET_MODE(state, { type, checked }) {
    state[type] = checked
  },
  TOGGLE_VIEW_MODE(state, entryName) {
    state[entryName] = !state[entryName]
  },
}

const actions = {
  getLocal({ commit }) {
    ipcRenderer.send('m::get-user-pref')

    ipcRenderer.on('m::user-pref', (e, preferences) => {
      commit('SET_PREFERENCE', preferences)
    })
  },
  // eslint-disable-next-line no-empty-pattern
  setOne({}, { type, value }) {
    // save to electron-store
    ipcRenderer.send('m::set-user-pref', { [type]: value })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
