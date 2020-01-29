// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'

const actions = {
  listenSidebar({ commit }) {
    ipcRenderer.on('m::view-sidebar', (event, value) => {
      commit('update_sidebar', value)
    })
  },
  listenFileSave({ dispatch }) {
    ipcRenderer.on('m::file-save', () => {
      dispatch('editor/saveNote', null, { root: true })
    })
  }
}

export default {
  actions
}
