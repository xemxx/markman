// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'
import { useEditorStore } from './editor'
import { useSyncStore } from './sync'
import { defineStore } from 'pinia'

import pinia from './index'
const editor = useEditorStore(pinia)
const sync = useSyncStore(pinia)

export const useListenStore = defineStore('listen', {
  actions: {
    listenFileSave() {
      ipcRenderer.on('m::file-save', async () => {
        await editor.saveNote()
        await sync.sync()
      })
    },
  },
})
