import http from '@/plugins/axios'
import { User } from '@/model/user'
import { NoteModel } from '@/model/note'
import { Notebook } from '@/model/notebook'
import { v1 as uuid } from 'uuid'
import { useUserStore, useEditorStore } from './index'
import { AxiosResponse } from 'axios'

import { defineStore } from 'pinia'

const notebookModel = new Notebook()
const userModel = new User()
const noteModel = new NoteModel()

const state = {
  //同步状态
  isSyncing: false,
  online: false,
  platform: process.env.platform,
}

interface SyncResp {
  isErr: boolean
  SC: string
  isRepeat: boolean
}

export const useSyncStore = defineStore('sync', {
  state: () => state,
  actions: {
    update_online(value: boolean) {
      this.online = value
      if (value == false) {
        setTimeout(() => this.checkServerOnline(), 10000)
      }
    },
    update_isSyncing(value: boolean) {
      this.isSyncing = value
    },

    async checkServerOnline() {
      const user = useUserStore()
      const server = user.server
      if (!navigator.onLine) {
        this.update_online(false)
        return false
      }
      try {
        await http.get<{ message: string }, any>(server + '/ping', {
          fetchOptions: { disableToast: true },
        })
        this.update_online(true)
        return true
      } catch (err) {
        this.update_online(false)
        return false
      }
    },

    async sync(force = false) {
      if (!force) {
        if (!this.online) {
          return
        }
        // 防止用户重复点击
        if (this.isSyncing) return
        this.isSyncing = true
      }
      const user = useUserStore()
      const uid = user.id
      const server = user.server
      try {
        // 获取本地上次更新版本号
        const { lastSC: localSC = '' } = await userModel.getLastSC(uid)
        // 获取服务端版本号
        const { SC: serverSC = '' } = await http.get<any, { SC: string }, any>(
          `${server}/user/getLastSyncCount`,
        )
        // 如果需要更新则拉取
        if (serverSC > localSC) {
          await this.pull({ localSC, serverSC })
        }
        await this.push()
        setTimeout(() => this.update_isSyncing(false), 1000)
      } catch (err) {
        console.log(err)
        setTimeout(() => this.update_isSyncing(false), 1000)
      }
      // TODO 当同步完成需要判断是不是远端有更新，然后sidebar的数据
    },

    async pull({ localSC, serverSC }) {
      const user = useUserStore()

      const uid = user.id
      await this._pullNotebooks(localSC)
      await this._pullNotes(localSC)
      await userModel.update(uid!, { lastSC: serverSC })
      user.update_lastSC(serverSC)
    },

    async push() {
      try {
        await this._pushNotebooks()
        await this._pushNotes()
      } catch (err: any) {
        if (err.rePull) {
          console.debug('need repull')
          // push过程中出现另一客户端对服务端进行了修改，需要重新pull
          setTimeout(() => {
            this.sync(true)
          }, 5000)
        }
        return Promise.reject(err)
      }
    },

    /**
     * pull细节
     */
    _pullNotebooks(afterSC: any) {
      const user = useUserStore()
      const server = user.server
      return http
        .get(`${server}/notebook/getSync?afterSC=${afterSC}&maxCount=10`)
        .then((data: any) => {
          const notebooks = data.notebooks
          if (notebooks.length > 0) {
            this._updateNotebooksToLocal(notebooks)
          }
          if (notebooks.length == 10) {
            return this._pullNotebooks(notebooks[notebooks.length - 1].SC)
          }
        })
    },

    _pullNotes(afterSC) {
      const user = useUserStore()
      const server = user.server
      return http
        .get(`${server}/note/getSync?afterSC=${afterSC}&maxCount=20`)
        .then((data: any) => {
          const notes = data.notes
          if (notes.length > 0) {
            this._updateNotesToLocal(notes)
          }
          if (notes.length == 20) {
            return this._pullNotes(notes[notes.length - 1].SC)
          }
        })
    },

    _updateNotebooksToLocal(serverData: any[]) {
      const user = useUserStore()
      const model = notebookModel
      const uid = user.id
      model.getLocalByServer(uid, serverData).then(data => {
        let localData = new Map()
        for (const row of data) {
          localData.set(row.guid, row)
        }
        // 根据guid对应遍历数据
        for (const server of serverData) {
          const local = localData.get(server.guid)
          let { guid, name, SC, sort, sortType, addDate, modifyDate } = server
          addDate = Date.parse(addDate) / 1000
          modifyDate = Date.parse(modifyDate) / 1000
          if (local != undefined) {
            if (server.isDel) {
              model.delete(local.id)
            } else
              switch (local.modifyState) {
                case 0: // 本地无冲突,覆盖到本地，并且更新modifyState
                  model.update(local.id, {
                    SC,
                    name,
                    sort,
                    sortType,
                    modifyDate,
                    modifyState: 0,
                  })
                  break
                case 1: // 代表本地新建，并且uuid冲突了，更新本地uuid即可，并且等会儿需要发送到服务端同步，暂时不需要更改modifyState
                  if (server.name == local.name) {
                    model.update(local.id, {
                      guid: uuid(),
                    })
                  }
                  //TODO 拉取远端到本地
                  break
                case 2: // 代表本地数据被修改，且服务端SC更高，需要进行冲突处理
                  // 笔记本的处理方案很简单，一般来说只存在笔记本名称的修改，如果是笔记本内的笔记被修改，也是后面处理笔记的冲突，所以只需要看修改时间覆盖掉就好，如果是本地覆盖服务端，则等会儿需要发送到服务端同步，暂时不需要更改modifyState
                  if (
                    Date.parse(local.modifyDate) < Date.parse(server.modifyDate)
                  ) {
                    model.update(local.id, {
                      name,
                      SC,
                      modifyDate,
                      modifyState: 0,
                    })
                  }
                  break
                case 3:
                  //代表本地进行了删除操作，并且没有发送到服务器同步，但是服务端的数据却在另一个客户端更新了还同步了，这是用户自己逻辑不清楚，所以不考虑
                  // 如果用户是先更新后删除，这里服务端的SC不会比本地高，所以一定是先删除，后更新，并且更新的同步到了远端，但是删除没有，才会出现这个情况
                  // 这里考虑删除远端数据，因为本地已经删除了，所以不需要考虑冲突
                  break
              }
          } else {
            // 如果不是已经删除的，直接同步到本地
            if (server.isDel === 0) {
              model.add({
                guid,
                SC,
                name,
                sort,
                sortType,
                addDate,
                modifyDate,
                uid,
                modifyState: 0, //0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据
              })
            }
          }
        }
      })
    },

    _updateNotesToLocal(serverData) {
      const user = useUserStore()
      const editor = useEditorStore()
      const model = noteModel
      const uid = user.id
      model.getLocalByServer(uid, serverData).then(data => {
        let localData = new Map()
        for (const row of data) {
          localData.set(row.guid, row)
        }
        for (const server of serverData) {
          const local = localData.get(server.guid)
          //获取要更新的值
          let { guid, title, content, SC, addDate, modifyDate, bid } = server
          addDate = Date.parse(addDate) / 1000
          modifyDate = Date.parse(modifyDate) / 1000

          if (local != undefined) {
            if (server.isDel == 1) {
              model.delete(local.id)
            } else
              switch (local.modifyState) {
                case 0: // 本地无冲突,覆盖到本地，并且更新modifyState
                  model.update(local.id, {
                    SC,
                    title,
                    content,
                    bid,
                    modifyDate,
                    modifyState: 0,
                  })
                  // 本地编辑器已经打开了需要同步
                  editor.flashNote(title, content, SC)
                  break
                case 1: // 代表本地之前新建没同步，并且uuid冲突了，更新本地uuid即可，并且等会儿需要发送到服务端同步，暂时不需要更改modifyState
                  if (server.name == local.name) {
                    model.update(local.id, {
                      guid: uuid(),
                    })
                  }
                  break
                case 2: {
                  // 代表本地数据被修改，且服务端SC更高，需要进行冲突处理
                  // 笔记的处理方案稍微复杂，因为不能丢失用户的数据，将两个端的数据均保存，让用户自己处理错误，暂时无法做到git那种定位冲突位置的办法
                  // 此时也不能更新本地的modifyState，因为需要在后面更新到服务端都显示冲突，等用户修改了冲突再更新到服务端
                  let newTitle = `local:${local.title} [---] server:${server.title}`
                  let newContent = `local>>>>>>>>>>>>>>\n${local.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${server.content}`
                  let newModifyDate =
                    Date.parse(local.modifyDate) < Date.parse(server.modifyDate)
                      ? Date.parse(server.modifyDate) / 1000
                      : Date.parse(local.modifyDate) / 1000
                  model.update(local.id, {
                    title: newTitle,
                    content: newContent,
                    modifyDate: newModifyDate,
                    SC, //SC也要更新，代表与服务端是统一版本的基础上做的修改
                  })
                  // 如果有冲突需要更新到编辑器上
                  editor.flashNote(newTitle, newContent, SC)
                  break
                }
                case 3: //代表本地进行了删除操作，并且没有发送到服务器同步，但是服务端的数据却在另一个客户端更新了还同步了，这是用户自己逻辑不清楚，所以不考虑
                  break
              }
          } else {
            // 如果不是已经删除的，直接同步到本地
            if (server.isDel === 0) {
              model.add({
                guid,
                SC,
                title,
                bid,
                content,
                addDate,
                modifyDate,
                uid,
                modifyState: 0, //0：不需要同步，1：新的东西，2：修改过的东西
              })
            }
          }
        }
      })
    },

    /**
     * push细节
     */
    async _pushNotebooks() {
      const user = useUserStore()
      console.log('sync notebooks')
      const uid = user.id
      const data = await notebookModel.getModify(uid)
      if (data.length > 0) {
        return await this._updateNotebooksToServer({ data, index: 0 })
      }
    },

    async _pushNotes() {
      const user = useUserStore()
      console.log('sync notes')
      const uid = user.id
      const data = await noteModel.getModify(uid)
      if (data.length > 0) {
        return await this._updateNotesToServer({ data, count: 0 })
      }
    },

    async _updateNotebooksToServer({ data, index: index }) {
      const user = useUserStore()
      if (index >= data.length) {
        return
      }
      const server = user.server
      const uid = user.id
      let result: AxiosResponse<SyncResp>
      const local = data[index]
      switch (local.modifyState) {
        case 1: {
          result = await http.post(`${server}/notebook/create`, local)
          break
        }
        case 2: {
          result = await http.post(`${server}/notebook/update`, local)
          break
        }
        case 3: {
          result = await http.post(`${server}/notebook/delete`, local)
          break
        }
        default: {
          console.error("BUG: modifyState isn't 1, 2 or 3")
          return
        }
      }
      const { isErr, SC, isRepeat } = result as unknown as SyncResp
      if (isErr) {
        // 在修改过程中，另一服务端进行了修改，产生了冲突，需要重新获取新的更新并在本地解决冲突
        return Promise.reject({ rePull: true })
      } else if (isRepeat) {
        //不唯一，需要修改guid重新发送改变
        data[index].guid = uuid()
        notebookModel.update(local.id, {
          guid: data[index].guid,
        })
        return this._updateNotebooksToServer({
          data,
          index: index,
        })
      } else if (SC == user.lastSC! + 1) {
        //成功的状态，更新本地lastSC和对应资源的SC
        if (local.modifyState == 3) {
          // 笔记本的删除，不代表本地的笔记已经可以被删除，所以这里只需要删除笔记本，其内的笔记会在后面的同步中删除
          await notebookModel.delete(local.id)
        } else {
          await notebookModel.update(local.id, { SC, modifyState: 0 })
        }
        await userModel.update(uid!, { lastSC: SC })
        user.update_lastSC(SC)
        return this._updateNotebooksToServer({ data, index: index + 1 })
      }
    },

    _updateNotesToServer({ data, count }) {
      const user = useUserStore()
      const editor = useEditorStore()
      console.log(count, data.length)
      if (count >= data.length) {
        return Promise.resolve()
      }
      const server = user.server
      const uid = user.id
      let result
      const local = data[count]
      switch (local.modifyState) {
        case 1: {
          result = http.post(`${server}/note/create`, local)
          break
        }
        case 2: {
          result = http.post(`${server}/note/update`, local)
          break
        }
        case 3: {
          result = http.post(`${server}/note/delete`, local)
          break
        }
      }
      return result.then(({ isErr, SC, isRepeat }) => {
        if (isErr) {
          // 在修改过程中，另一服务端进行了修改，产生了冲突，需要重新获取新的更新并在本地解决冲突
          return Promise.reject({ rePull: true })
        } else if (isRepeat) {
          //不唯一，需要修改guid重新发送改变
          data[count].guid = uuid()
          noteModel.update(local.id, {
            guid: data[count].guid,
          })
          return this._updateNotesToServer({
            data,
            count,
          })
        } else if (SC == user.lastSC! + 1) {
          //成功的状态，更新本地lastSC和对应资源的SC
          if (local.modifyState == 3) {
            noteModel.delete(local.id)
          } else {
            noteModel.update(local.id, { SC, modifyState: 0 })
          }
          user.update_lastSC(SC)
          userModel.update(uid!, { lastSC: SC })
          if (data[count].id == editor.currentNote.id) {
            editor.flashNote(
              editor.currentNote.title,
              editor.currentNote.markdown,
              SC,
            )
          }
          return this._updateNotesToServer({ data, count: count + 1 })
        } else {
          console.log('not update')
        }
      })
    },
  },
})

window.addEventListener('online', () => useSyncStore().update_online(true))
window.addEventListener('offline', () => useSyncStore().update_online(false))
