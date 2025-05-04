import { NodeModel, NodeItem } from '@/model/node'

import { emitter } from '@/lib/emitter.ts'
import { defineStore } from 'pinia'
import { usePreferenceStore, useSyncStore } from './index'

const nodeModel = new NodeModel()

const autoSaveTimers = new Map()

const defaultNote: NodeItem = {
  id: 0,
  uid: 0,
  guid: '',
  parentId: '',
  title: '',
  content: '',
  type: 'note',
  sort: 0,
  sortType: 0,
  modifyState: 0,
  SC: 0,
  modifyDate: 0,
  addDate: 0,
}
import { Crepe } from '@milkdown/crepe'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    isEdit: false,
    dbNote: defaultNote,
    editContent: '',
    modify: false,
    isSaving: false,
    editor: null as Crepe | null,
    isLoadNewNote: false,
  }),
  actions: {
    closeEditor() {
      this.$reset()
    },
    // flash note
    async flashNote(updateEditor = true) {
      if (updateEditor) {
        return this.loadNote(this.dbNote.id)
      }
      const data = await nodeModel.get(this.dbNote.id)
      if (data == undefined) return false
      this.dbNote = data
    },

    // click note to load note from sqlite
    checkoutNote(id: number) {
      const { id: oldId } = this.dbNote
      if (id == oldId) {
        return
      }

      // close and save old note
      if (oldId != id && oldId != undefined) {
        // ask user if note need save
        if (this.editContent.trimEnd() != this.dbNote.content.trimEnd()) {
          emitter.emit('query-close-note', id)
          return
        }
      }
      return this.loadNote(id)
    },

    async loadNote(id: number) {
      try {
        // load new note
        const data = await nodeModel.get(id)
        if (data == undefined) return false
        this.dbNote = data
        this.isLoadNewNote = true
        this.isEdit = true
        this.editContent = data.content
        this.modify = false
        return true
      } catch (err) {
        console.log(err)
      }
    },

    // save note to sqlite
    async saveNote() {
      // 如果编辑器未打开，则不保存，对应场景是删除当前编辑的笔记时，编辑器会关闭
      if (this.isEdit == false) {
        return
      }
      if (this.isSaving) {
        return
      }
      this.isSaving = true
      let { content = '', id = 0, title = '', SC = 0 } = this.dbNote
      if (id == undefined || id == 0) {
        this.isSaving = false
        return
      }
      const newContent = this.editContent
      if (newContent == content) {
        console.debug('no need save')
        this.isSaving = false
        return
      }
      try {
        const origin = await nodeModel.get(id)
        // 只有当远端的SC大于本地的SC时，才需要解决冲突，否则直接更新本地覆盖即可
        if (origin.SC > SC) {
          console.debug('need fix conflict')
          console.debug(origin.SC)
          console.debug(SC)
          await this.__fixConflict()
          this.isSaving = false
          return
        }
        // update sqlite
        const { modifyState } = origin
        const time = Date.parse(Date()) / 1000
        const data = {
          content: newContent,
          title,
          modifyState: modifyState == 0 ? 2 : modifyState,
          modifyDate: time,
        }
        await nodeModel.update(id, data)
        this.dbNote.content = newContent
        this.dbNote.title = title
        this.dbNote.modifyState = modifyState == 0 ? 2 : modifyState
        this.dbNote.modifyDate = time
        this.isSaving = false
        const sync = useSyncStore()
        sync.sync()
      } catch (err) {
        this.isSaving = false
        console.log(err)
      }
    },

    // 更新编辑器内容
    updateContent(content: string) {
      this.editContent = content
      if (this.editContent != content) {
        this.modify = true
      }
    },

    handleAutoSave() {
      const preference = usePreferenceStore()
      const { autoSave, autoSaveDelay } = preference
      if (!autoSave) return

      if (autoSaveTimers.has(this.dbNote.id)) {
        clearTimeout(autoSaveTimers.get(this.dbNote.id))
        autoSaveTimers.delete(this.dbNote.id)
      }
      const timeFunc = setTimeout(async () => {
        autoSaveTimers.delete(this.dbNote.id)
        console.debug('do auto save')
        if (this.editor != null) {
          await this.saveNote()
        }
      }, autoSaveDelay)
      autoSaveTimers.set(this.dbNote.id, timeFunc)
    },

    //no feel to conflict
    async __fixConflict() {
      try {
        let local = this.dbNote
        let server = await nodeModel.get(local.id)
        let newTitle = `local:${local.title} [---] server:${server.title}`
        let newContent = `local>>>>>>>>>>>>>>\n${local.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${server.content}`
        let newModifyDate = Date.parse(Date()) / 1000
        await nodeModel.update(local.id, {
          title: newTitle,
          content: newContent,
          modifyDate: newModifyDate,
          modifyState: 2,
        })

        this.loadNote(local.id)
      } catch (err) {
        console.log(err)
      }
    },
  },
})
