// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'

const actions = {
  listenFileSave({ dispatch }) {
    ipcRenderer.on('m::file-save', () => {
      dispatch('editor/saveNote', null, { root: true })
    })
  }
}

export default {
  actions
}
