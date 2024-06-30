import { NoteModel } from '@/model/note'
import { v1 as uuid } from 'uuid'

import { emitter } from '@/emitter'
import { useUserStore } from './user'
import { useSidebarStore } from './sidebar'
import { defineStore } from 'pinia'
import { useSyncStore } from './sync'
import { usePreferenceStore } from './preference'

const nModel = new NoteModel()

const autoSaveTimers = new Map()

interface DNote {
  id: number
  markdown: string
  title: string
  content?: string
  SC: number
  isSave: boolean
  latestContent?: string
}
const defaultNote: DNote = {
  id: 0,
  markdown: '',
  content: '',
  latestContent: '',
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
      latestContent: '',
      title: '',
      SC: 0,
      isSave: true,
    },
    modify: false,
    isSaving: false,
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
          latestContent: '',
        }
        this.set_current_note(current)
        this.isEdit = true
      } catch (err) {
        console.log(err)
      }
    },

    addNote(bid: any) {
      const user = useUserStore()
      const sidebar = useSidebarStore()

      const time = Date.parse(Date()) / 1000
      const note = {
        uid: user.id,
        guid: uuid(),
        bid,
        title: '未命名',
        content: '',
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: 0, //新建时该值无用
        addDate: time,
        modifyDate: time,
      }
      return nModel
        .add(note)
        .then((id: any) => {
          return sidebar.loadNotes().then(() => {
            this.loadNote(id)
          })
        })
        .catch((err: any) => console.log(err))
    },

    // save note to sqlite
    async saveNote(
      { markdown = '', id = '', title = '', SC = 0, isSave = false } = <
        DNote
      >{},
    ) {
      const sidebar = useSidebarStore()

      if (id == undefined || id == '') {
        return
      }
      if (isSave) {
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
      await sidebar.loadNotes()
    },

    async deleteNote(id: number) {
      const sidebar = useSidebarStore()
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
        sidebar.loadNotes().then(() => {
          if (id == this.currentNote.id) {
            this.set_current_note(defaultNote)
            this.isEdit = false
          }
        })
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
        this.handleAutoSave(this.currentNote)
      }
    },

    updateContent(content: string) {
      if (content != this.currentNote.markdown) {
        this.currentNote.markdown = content
        this.currentNote.isSave = false
        this.handleAutoSave(this.currentNote)
      }
    },

    handleAutoSave({ id, title, markdown, SC, isSave }) {
      const preference = usePreferenceStore()
      const { autoSave, autoSaveDelay } = preference
      if (!autoSave) return

      if (autoSaveTimers.has(id)) {
        clearTimeout(autoSaveTimers.get(id))
        autoSaveTimers.delete(id)
      }
      const timeFunc = setTimeout(async () => {
        autoSaveTimers.delete(id)
        console.debug('do auto save')
        await this.saveNote({ id, title, markdown, SC, isSave })
      }, autoSaveDelay)
      autoSaveTimers.set(id, timeFunc)
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
