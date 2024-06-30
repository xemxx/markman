// import Sync from "../../model/sync.js";
import { ipcRenderer } from 'electron'
import { useEditorStore } from './editor'
import { useSyncStore } from './sync'
import { defineStore } from 'pinia'

import pinia from './index'
const editor = useEditorStore(pinia)
const sync = useSyncStore(pinia)

export const useListenStore = defineStore('listen', {
  state() {
    return {
      inSave: false,
    }
  },
  actions: {
    listenFileSave() {
      ipcRenderer.on('m::file-save', async () => {
        // 多次点击不能多次保存，因为上一次会同步服务端，可能有正在处理的冲突
        if (this.inSave) return
        this.inSave = true
        await editor.saveNote(editor.currentNote)
        await sync.sync()
        this.inSave = false
      })
    },
  },
})
