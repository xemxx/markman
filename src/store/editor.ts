import { NoteModel } from '@/model/note'
import { v1 as uuid } from 'uuid'

import { emitter } from '@/emitter'
import { Debug } from 'main/log'
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
  modifyState?: number
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
  modifyState: 0,
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
      modifyState: 0,
      SC: 0,
      isSave: true,
    },
    modify: false,
  }),
  // getters: {
  //   isSave: state => {
  //     state.currentNote.latestContent == state.currentNote.content
  //   },
  // },
  actions: {
    set_current_note(currentNote: DNote) {
      this.currentNote = currentNote
    },
    set_save_status(status: boolean) {
      this.currentNote.isSave = status
    },
    set_title(value: string) {
      this.currentNote.title = value
    },
    set_markdown(value: string) {
      this.currentNote.markdown = value
    },
    // flash note
    async flashNote() {
      const { id, isSave, SC } = this.currentNote
      try {
        const data = await nModel.get(id)
        if (data == undefined) return
        // current note has no updated
        if (data.SC == SC) return

        // flash current note from server new version
        if (isSave) {
          let current: DNote = {
            id: data.id,
            markdown: data.content,
            title: data.title,
            modifyState: data.modifyState,
            SC: data.SC,
            isSave: true,
            content: '',
            latestContent: '',
          }
          this.set_current_note(current)
          this.isEdit = true
        }
        // local has changed and server has changed too,need fix conflict
        else await this.__fixConflict()
      } catch (err) {
        console.log(err)
      }
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
          modifyState: data.modifyState,
          SC: data.SC,
          isSave: true,
          content: '',
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
        console.log('no need save')
        return
      }
      const origin = await nModel.get(id)
      if (origin.content == markdown && origin.title == title) {
        return
      }
      // server have new version and local note be changed
      if (origin.SC != SC) {
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
      return nModel
        .update(id, data)
        .then(() => {
          sidebar.loadNotes()
          this.set_save_status(true)
        })
        .catch((err: any) => console.log(err))
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

    // listen the content change and apply to state
    listenContentChange({
      title = undefined,
      markdown = undefined,
    }: {
      title: string | undefined
      markdown: string | undefined
    }) {
      let { isSave } = this.currentNote
      if (title && title != this.currentNote.title) {
        this.set_title(title)
        isSave = false
      }
      if (markdown && markdown != this.currentNote.markdown) {
        this.set_markdown(markdown)
        isSave = false
        console.log('markdown changed')
      }
      this.currentNote.isSave = isSave
      this.handleAutoSave(this.currentNote)
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
        Debug('do auto save')
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
        local.markdown = newContent
        local.modifyState = 2
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
