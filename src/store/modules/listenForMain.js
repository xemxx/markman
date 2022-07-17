// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'

const actions = {
  listenFileSave({ dispatch }) {
    ipcRenderer.on('m::file-save', async () => {
      await dispatch('editor/saveNote', undefined, { root: true })
      await dispatch('sync/sync', undefined, { root: true })
    })
  },
}

export default {
  actions,
}
