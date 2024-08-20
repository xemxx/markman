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
  tid: string
}
const state: State = {
  notebooks: [],
  type: 'all',
  flagId: '',
  notes: [],
  tid: '',
}

export const useSidebarStore = defineStore('sidebar', {
  state: () => state,
  actions: {
    update_notebooks(value: []) {
      this.notebooks = value
    },
    update_notes({ type, flagId, notes }) {
      this.type = type ? type : this.type
      this.flagId = flagId ? flagId : this.tid
      this.notes = notes ? notes : this.notes
    },
    loadNotebooks() {
      return model
        .getAll(user.id)
        .then((notebooks: any) => {
          this.update_notebooks(notebooks)
        })
        .catch((err: any) => {
          console.log(err)
        })
    },

    addNotebook(name: any) {
      const sync = useSyncStore(pinia)
      const time = Date.parse(Date()) / 1000
      return model
        .add({
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
        .then(() => {
          //同步服务器
          sync.sync()
        })
        .catch((err: any) => console.log(err))
    },

    deleteNotebook(id: any) {
      const sync = useSyncStore(pinia)
      let guid = ''
      for (let i = 0; i < this.notebooks.length; i++) {
        if (this.notebooks[i].id == id) {
          guid = this.notebooks[i].guid
        }
      }
      return model
        .deleteLocal(id, guid)
        .then(() => {
          //更新列表显示
          this.loadNotebooks()
          if (this.type != 'all' && this.flagId == guid) {
            this.loadNotes({ type: 'all' })
          }
          //同步服务器
          sync.sync()
        })
        .catch((err: any) => console.log(err))
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

    moveNote({ id, bid }) {
      const sync = useSyncStore(pinia)
      return nModel
        .update(id, { bid, modifyState: 2 })
        .then(() => {
          sync.sync()
          this.loadNotebooks()
        })
        .catch((err: any) => console.log(err))
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
