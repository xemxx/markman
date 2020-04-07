import { ipcRenderer } from 'electron'

// user preference
const state = {
  autoSave: false,
  autoSaveDelay: 5000
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
  }
}

const actions = {
  getLocal({ commit }) {
    ipcRenderer.send('m::get-user-pref')
    ipcRenderer.send('mt::ask-for-user-data')

    ipcRenderer.on('m::send-user-pref', (e, preferences) => {
      commit('SET_PREFERENCE', preferences)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
