import { NoteModel } from '@/model/note'
import { v1 as uuid } from 'uuid'

import { emitter } from '@/emitter'
import { useUserStore } from './user'
import { useSidebarStore } from './sidebar'
import { defineStore } from 'pinia'
import { useSyncStore } from './sync'
import { usePreferenceStore } from './preference'
import Vditor from 'vditor'

const nModel = new NoteModel()

const autoSaveTimers = new Map()

interface DNote {
  id: number
  markdown: string
  title: string
  content?: string
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
    modify: false,
    isSaving: false,
    vidtor: <Vditor | null>null,
  }),
  actions: {
    set_current_note(currentNote: DNote) {
      this.currentNote = currentNote
    },
    // flash note
    flashNote(title: string, content: string, SC: number) {
      this.currentNote.title = title
      this.currentNote.content = content
      this.currentNote.markdown = content
      this.currentNote.SC = SC
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
        const data = await nModel.get(id)
        if (data == undefined) return

        let current: DNote = {
          id: data.id,
          markdown: data.content,
          title: data.title,
          SC: data.SC,
          isSave: true,
          content: data.content,
        }
        this.set_current_note(current)
        this.isEdit = true
      } catch (err) {
        console.log(err)
      }
    },

    // save note to sqlite
    async saveNote() {
      if (this.vidtor == null) {
        throw new Error('not init vditor')
      }
      let {
        markdown = '',
        id = 0,
        title = '',
        SC = 0,
        isSave = false,
      } = this.currentNote
      if (id == undefined || id == 0) {
        return
      }
      const newContent = this.vidtor?.getValue()
      this.currentNote.markdown = newContent
      markdown = newContent
      if (isSave && newContent == this.currentNote.content) {
        console.debug(markdown, title, SC)
        console.debug('no need save')
        return
      }
      const origin = await nModel.get(id)
      if (origin.content == markdown && origin.title == title) {
        return
      }
      // 只有当远端的SC大于本地的SC时，才需要解决冲突，否则直接更新本地覆盖即可
      if (origin.SC > SC) {
        console.debug('need fix conflict')
        console.debug(origin.SC)
        console.debug(SC)
        return this.__fixConflict
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
      await nModel.update(id, data)
      this.currentNote.isSave = true
      const sidebar = useSidebarStore()
      await sidebar.loadNotes()
    },

    async deleteNote(id: number) {
      try {
        const { modifyState } = await nModel.get(id)
        if (modifyState == 1) {
          await nModel.delete(id)
        } else {
          const time = Date.parse(Date()) / 1000
          const data = {
            modifyState: 3,
            modifyDate: time,
          }
          await nModel.update(id, data)
        }
        if (id == this.currentNote.id) {
          this.set_current_note(defaultNote)
          this.isEdit = false
        }
        const sync = useSyncStore()
        sync.sync()
      } catch (err) {
        console.log(err)
      }
    },

    updateTitle(title: string) {
      if (title != this.currentNote.title) {
        this.currentNote.title = title
        this.currentNote.isSave = false
        this.handleAutoSave()
      }
    },

    updateContent(content: string) {
      console.debug('update content', content)
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
        await this.saveNote()
      }, autoSaveDelay)
      autoSaveTimers.set(this.currentNote.id, timeFunc)
    },

    //no feel to conflict
    async __fixConflict() {
      const sidebar = useSidebarStore()

      try {
        let local = this.currentNote
        let server = await nModel.get(local.id)
        let newTitle = `local:${local.title} [---] server:${server.title}`
        let newContent = `local>>>>>>>>>>>>>>\n${local.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${server.content}`
        let newModifyDate = Date.parse(Date()) / 1000
        await nModel.update(local.id, {
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
        this.set_current_note(local)

        sidebar.loadNotes()
      } catch (err) {
        console.log(err)
      }
    },
  },
})
