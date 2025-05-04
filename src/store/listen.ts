// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'
import { useEditorStore, useSyncStore } from './index'
import { defineStore } from 'pinia'

export const useListenStore = defineStore('listen', {
  state() {
    return {
      inSave: false,
    }
  },
  actions: {
    listenFileSave() {
      const editor = useEditorStore()
      const sync = useSyncStore()
      ipcRenderer.on('m::file-save', async () => {
        await editor.saveNote()
      })
    },
  },
})
