import http from '@/plugins/axios'
import { User } from '@/model/user'
import { NodeModel } from '@/model/node'
import { v1 as uuid } from 'uuid'
import { useUserStore, useEditorStore } from './index'
import { AxiosResponse } from 'axios'

import { defineStore } from 'pinia'

const nodeModel = new NodeModel()
const userModel = new User()

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
      if (!value) {
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
    },

    async pull({ localSC, serverSC }) {
      const user = useUserStore()

      const uid = user.id
      await this._pullNodes(localSC)
      await userModel.update(uid!, { lastSC: serverSC })
      user.update_lastSC(serverSC)
    },

    async push() {
      try {
        await this._pushNodes()
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
    _pullNodes(afterSC: any) {
      const user = useUserStore()
      const server = user.server
      return http
        .get(`${server}/node/getSync?afterSC=${afterSC}&maxCount=20`)
        .then((data: any) => {
          const nodes = data.nodes
          if (nodes.length > 0) {
            this._updateNodesToLocal(nodes)
          }
          if (nodes.length == 20) {
            return this._pullNodes(nodes[nodes.length - 1].SC)
          }
        })
    },

    _updateNodesToLocal(serverData: any[]) {
      const user = useUserStore()
      const editor = useEditorStore()
      const uid = user.id
      if (uid === null) {
        console.error('User ID is null')
        return
      }
      nodeModel.getLocalByServer(uid, serverData).then(data => {
        let localData = new Map()
        for (const row of data) {
          localData.set(row.guid, row)
        }
        for (const server of serverData) {
          const local = localData.get(server.guid)
          //获取要更新的值
          let { guid, title, content, SC, addDate, modifyDate, parentId, type, sort, sortType } = server
          addDate = Date.parse(addDate) / 1000
          modifyDate = Date.parse(modifyDate) / 1000

          if (local != undefined) {
            if (server.isDel == 1) {
              nodeModel.delete(local.id)
            } else
              switch (local.modifyState) {
                case 0: // 本地无冲突,覆盖到本地，并且更新modifyState
                  nodeModel.update(local.id, {
                    SC,
                    title,
                    content,
                    parentId,
                    type,
                    sort,
                    sortType,
                    modifyDate,
                    modifyState: 0,
                  })
                  // 如果是笔记且本地编辑器已经打开了需要同步
                  if (type === 'note' && local.id === editor.currentNote.id) {
                    editor.flashNote(title, content, SC)
                  }
                  break
                case 1: // 代表本地之前新建没同步，并且uuid冲突了，更新本地uuid即可，并且等会儿需要发送到服务端同步，暂时不需要更改modifyState
                  if (server.title === local.title) {
                    nodeModel.update(local.id, {
                      guid: uuid(),
                    })
                  }
                  break
                case 2: {
                  // 代表本地数据被修改，且服务端SC更高，需要进行冲突处理
                  if (type === 'folder') {
                    // 文件夹的处理方案很简单，一般来说只存在文件夹名称的修改，所以只需要看修改时间覆盖掉就好
                    if (Date.parse(local.modifyDate) < Date.parse(server.modifyDate)) {
                      nodeModel.update(local.id, {
                        title,
                        SC,
                        modifyDate,
                        modifyState: 0,
                      })
                    }
                  } else {
                    // 笔记的处理方案稍微复杂，因为不能丢失用户的数据，将两个端的数据均保存，让用户自己处理错误
                    let newTitle = `local:${local.title} [---] server:${server.title}`
                    let newContent = `local>>>>>>>>>>>>>>\n${local.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${server.content}`
                    let newModifyDate =
                      Date.parse(local.modifyDate) < Date.parse(server.modifyDate)
                        ? Date.parse(server.modifyDate) / 1000
                        : Date.parse(local.modifyDate) / 1000
                    nodeModel.update(local.id, {
                      title: newTitle,
                      content: newContent,
                      modifyDate: newModifyDate,
                      SC, //SC也要更新，代表与服务端是统一版本的基础上做的修改
                    })
                    // 如果有冲突且当前正在编辑，需要更新到编辑器上
                    if (local.id === editor.currentNote.id) {
                      editor.flashNote(newTitle, newContent, SC)
                    }
                  }
                  break
                }
                case 3: //代表本地进行了删除操作，并且没有发送到服务器同步，但是服务端的数据却在另一个客户端更新了还同步了，这是用户自己逻辑不清楚，所以不考虑
                  break
              }
          } else {
            // 如果不是已经删除的，直接同步到本地
            if (server.isDel === 0) {
              nodeModel.add({
                guid,
                SC,
                title,
                content,
                parentId,
                type,
                sort,
                sortType,
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
    async _pushNodes() {
      const user = useUserStore()
      console.log('sync nodes')
      const uid = user.id
      if (uid === null) {
        console.error('User ID is null')
        return
      }
      const data = await nodeModel.getModify(uid)
      if (data.length > 0) {
        return await this._updateNodesToServer({ data, index: 0 })
      }
    },

    async _updateNodesToServer({ data, index }) {
      const user = useUserStore()
      const editor = useEditorStore()

      if (index >= data.length) {
        return Promise.resolve()
      }

      const server = user.server
      const uid = user.id
      let result
      const local = data[index]

      switch (local.modifyState) {
        case 1: {
          result = await http.post(`${server}/node/create`, local)
          break
        }
        case 2: {
          result = await http.post(`${server}/node/update`, local)
          break
        }
        case 3: {
          result = await http.post(`${server}/node/delete`, local)
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
        nodeModel.update(local.id, {
          guid: data[index].guid,
        })
        return this._updateNodesToServer({
          data,
          index,
        })
      } else if (SC == user.lastSC! + 1) {
        //成功的状态，更新本地lastSC和对应资源的SC
        if (local.modifyState == 3) {
          // 如果是删除操作，直接删除本地数据
          await nodeModel.delete(local.id)
        } else {
          await nodeModel.update(local.id, { SC, modifyState: 0 })
        }

        // 更新用户的lastSC
        await userModel.update(uid!, { lastSC: SC })
        user.update_lastSC(SC)

        // 如果当前正在编辑的笔记被更新，需要更新编辑器
        if (local.type === 'note' && local.id == editor.currentNote.id) {
          editor.flashNote(
            editor.currentNote.title,
            editor.currentNote.markdown,
            Number(SC),
          )
        }

        // 继续处理下一个节点
        return this._updateNodesToServer({ data, index: index + 1 })
      } else {
        console.log('not update')
      }
    },
  },
})

window.addEventListener('online', () => useSyncStore().update_online(true))
window.addEventListener('offline', () => useSyncStore().update_online(false))
