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
  },
  listenPreview({ commit }) {
    ipcRenderer.on('m::view-preview', (event, value) => {
      commit('update_preview', value)
    })
  }
}

export default {
  actions
}
