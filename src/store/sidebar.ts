import { Notebook, notebookItem } from '@/model/notebook.js'
import { noteItem, NoteModel } from '@/model/note'
import { v1 as uuid } from 'uuid'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useSyncStore } from './sync'

import pinia from './index'

const user = useUserStore(pinia)

const model = new Notebook()

const nModel = new NoteModel()

interface State {
  notebooks: notebookItem[]
  type: string
  flagId: string
  notes: noteItem[]
  noteTree: {
    book: notebookItem
    notes: noteItem[]
  }[]
  tid: string
}
const state: State = {
  notebooks: [],
  type: 'all',
  flagId: '',
  notes: [],
  tid: '',
  noteTree: [],
}

export const useSidebarStore = defineStore('sidebar', {
  state: () => state,
  actions: {
    update_notebooks(value: notebookItem[]) {
      this.notebooks = value
    },
    update_notes({ type, flagId, notes }) {
      this.type = type ? type : this.type
      this.flagId = flagId ? flagId : this.tid
      this.notes = notes ? notes : this.notes
    },
    async loadNodeTree() {
      try {
        const notebooks = await model.getAll(user.id)
        this.noteTree = await Promise.all(
          notebooks.map(async item => {
            const notes = await nModel.getAllByBook(user.id, item.guid)
            return {
              book: item,
              notes: notes,
            }
          }),
        )
      } catch (err) {
        console.log(err)
      }
    },
    async loadNotebooks() {
      try {
        const notebooks = await model.getAll(user.id)
        this.update_notebooks(notebooks)
      } catch (err) {
        console.log(err)
      }
    },

    async addNotebook(name: any) {
      const sync = useSyncStore(pinia)
      const time = Date.parse(Date()) / 1000
      try {
        await model.add({
          uid: user.id,
          name: name,
          guid: uuid(),
          modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
          SC: 0, //暂时不用
          sort: 1, //暂时不用
          sortType: 1, //暂时不用
          addDate: time,
          modifyDate: time,
        })
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async deleteNotebook(id: any) {
      const sync = useSyncStore(pinia)
      let guid = ''
      for (let i = 0; i < this.notebooks.length; i++) {
        if (this.notebooks[i].id == id) {
          guid = this.notebooks[i].guid
        }
      }
      try {
        await model.deleteLocal(id, guid)
        //更新列表显示
        this.loadNotebooks()
        if (this.type != 'all' && this.flagId == guid) {
          this.loadNotes({ type: 'all' })
        }
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    updateNotebook({ id, name }) {
      const sync = useSyncStore(pinia)
      let finded = this.notebooks.find(item => id === item.id)
      if (finded == undefined) {
        return
      }
      const { modifyState } = finded
      if (name != '') {
        return model
          .update(id, {
            name,
            modifyState: modifyState === 0 ? 2 : modifyState,
          })
          .then(() => {
            //更新列表显示
            this.loadNotebooks()
            //同步服务器
            sync.sync()
          })
          .catch((err: any) => console.log(err))
      }
    },

    //更新state中的list，视图将自动更新
    async loadNotes({ type = '', flagId = '' } = {}) {
      const uid = user.id
      let list: Promise<{}>
      if (type == undefined || type == '') {
        type = this.type
      }
      if (flagId == undefined || flagId == '') {
        flagId = this.flagId
      }
      if (type == 'note') {
        list = nModel.getAllByBook(uid, flagId)
      } else if (type == 'tag') {
        list = nModel.getAllByTag(uid, flagId)
      } else if (type == 'all') {
        list = nModel.getAll(uid)
        flagId = '0'
      } else {
        return Promise.reject(new Error('flagID and type is not define'))
      }

      const notes = await list
      this.update_notes({
        type,
        flagId,
        notes: notes,
      })
    },

    async moveNote({ id, bid }) {
      const sync = useSyncStore(pinia)
      try {
        await nModel.update(id, { bid, modifyState: 2 })
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async searchNotes(search: string) {
      let list: noteItem[] = []
      if (this.type == 'note') {
        list = await nModel.searchContentInBook(user.id, this.flagId, search)
      } else if (this.type == 'tag') {
        list = nModel.searchContentInTag(user.id, this.flagId, search)
      } else if (this.type == 'all') {
        list = await nModel.searchContentInAll(user.id, search)
      }
      this.update_notes({
        type: this.type,
        flagId: this.flagId,
        notes: list,
      })
    },
  },
})
