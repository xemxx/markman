import { NodeModel } from '@/model/node'

import { emitter } from '@/lib/emitter.ts'
import { defineStore } from 'pinia'
import { useSyncStore, usePreferenceStore, useSidebarStore } from './index'
import Vditor from 'vditor'
import { replaceAll } from '@milkdown/kit/utils'

const nodeModel = new NodeModel()

const autoSaveTimers = new Map()

interface DNote {
  id: number
  markdown: string
  title: string
  content: string //数据库内容
  SC: number
  isSave: boolean
}
const defaultNote: DNote = {
  id: 0,
  markdown: '',
  content: '',
  title: '',
  SC: 0,
  isSave: true,
}
import { Crepe } from '@milkdown/crepe'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    isEdit: false,
    currentNote: <DNote>{
      id: 0,
      markdown: '',
      content: '',
      title: '',
      SC: 0,
      isSave: true,
    },
    editContent: '',
    modify: false,
    isSaving: false,
    vidtor: <Vditor | null>null,
    editor: <Crepe | null>null,
    isLoadNewNote: false,
  }),
  actions: {
    resetDefaultNote() {
      this.currentNote = defaultNote
    },
    // flash note
    flashNote(title: string, content: string, SC: number) {
      this.currentNote.title = title
      this.currentNote.content = content
      this.currentNote.markdown = content
      this.currentNote.SC = SC
      this.editContent = content
    },

    // click note to load note from sqlite
    checkoutNote(id: number) {
      const { id: oldId, isSave } = this.currentNote
      if (id == oldId) {
        return
      }

      // close and save old note
      if (oldId != id && oldId != undefined) {
        // ask user if note need save
        if (!isSave) {
          emitter.emit('query-close-note', id)
          return
        }
      }
      this.loadNote(id)
    },

    async loadNote(id: number) {
      try {
        // load new note
        const data = await nodeModel.get(id)
        if (data == undefined) return
        this.currentNote = {
          id: data.id,
          markdown: data.content,
          title: data.title,
          SC: data.SC,
          isSave: true,
          content: data.content,
        }
        this.isLoadNewNote = true
        this.isEdit = true
      } catch (err) {
        console.log(err)
      }
    },

    // save note to sqlite
    async saveNote() {
      if (this.editor == null) {
        throw new Error('not init vditor')
      }
      if (this.isSaving) {
        return
      }
      this.isSaving = true
      let {
        markdown = '',
        id = 0,
        title = '',
        SC = 0,
        isSave = false,
      } = this.currentNote
      if (id == undefined || id == 0) {
        this.isSaving = false
        return
      }
      const newContent = this.editor.getMarkdown()
      this.currentNote.markdown = newContent
      markdown = newContent
      if (isSave && newContent == this.currentNote.content) {
        console.debug('no need save')
        this.isSaving = false
        return
      }
      try {
        const origin = await nodeModel.get(id)
        if (origin.content == markdown && origin.title == title) {
          this.isSaving = false
          return
        }
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
          content: markdown,
          title,
          modifyState: modifyState == 0 ? 2 : modifyState,
          modifyDate: time,
        }
        await nodeModel.update(id, data)
        this.currentNote.isSave = true
        this.isSaving = false
      } catch (err) {
        this.isSaving = false
        console.log(err)
      }
    },

    updateContent(content: string) {
      if (content != this.currentNote.content) {
        this.currentNote.markdown = content
        this.currentNote.isSave = false
        this.handleAutoSave()
      }
    },

    handleAutoSave() {
      const preference = usePreferenceStore()
      const { autoSave, autoSaveDelay } = preference
      if (!autoSave) return

      if (autoSaveTimers.has(this.currentNote.id)) {
        clearTimeout(autoSaveTimers.get(this.currentNote.id))
        autoSaveTimers.delete(this.currentNote.id)
      }
      const timeFunc = setTimeout(async () => {
        autoSaveTimers.delete(this.currentNote.id)
        console.debug('do auto save')
        if (this.editor != null) {
          await this.autoSaveNote(this.editor.getMarkdown())
        }
      }, autoSaveDelay)
      autoSaveTimers.set(this.currentNote.id, timeFunc)
    },

    async autoSaveNote(newContent: string) {
      if (this.isSaving) {
        return
      }
      this.isSaving = true
      let {
        markdown = '',
        id = 0,
        title = '',
        SC = 0,
        isSave = false,
      } = this.currentNote
      if (id == undefined || id == 0) {
        this.isSaving = false
        return
      }
      this.currentNote.markdown = newContent
      markdown = newContent
      if (isSave && newContent == this.currentNote.content) {
        console.debug('no need save')
        this.isSaving = false
        return
      }
      try {
        const origin = await nodeModel.get(id)
        if (origin.content == markdown && origin.title == title) {
          this.isSaving = false
          return
        }
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
          content: markdown,
          title,
          modifyState: modifyState == 0 ? 2 : modifyState,
          modifyDate: time,
        }
        await nodeModel.update(id, data)
        this.currentNote.isSave = true
        this.isSaving = false
      } catch (err) {
        this.isSaving = false
        console.log(err)
      }
    },

    //no feel to conflict
    async __fixConflict() {
      const sidebar = useSidebarStore()

      try {
        let local = this.currentNote
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

        local.title = newTitle
        local.content = newContent
        local.markdown = newContent
        local.SC = server.SC
        local.isSave = true
        this.currentNote = local
      } catch (err) {
        console.log(err)
      }
    },
  },
})
