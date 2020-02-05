// import Sync from "../../model/sync.js";
import axios from '../../plugins/axios'
import User from '../../model/user'
import Note from '../../model/note'
import Notebook from '../../model/notebook'
import uuid from 'uuid/v1'

const notebookModel = new Notebook()
const userModel = new User()
const noteModel = new Note()

const state = {
  //同步状态
  isSyncing: false
}

const mutations = {
  update_isSyncing(state, value) {
    state.isSyncing = value
  }
}

const actions = {
  async sync({ commit, dispatch, rootState }) {
    commit('update_isSyncing', true)
    const uid = rootState.user.id
    const server = rootState.user.server
    try {
      const { lastSC: localSC = '' } = await userModel.getLastSC(uid)
      const { SC: serverSC = '' } = await axios.get(
        `${server}/user/getLastSyncCount`
      )

      if (serverSC > localSC) {
        await dispatch('pull', { localSC, serverSC })
      } else {
        await dispatch('push')
      }
      //更新完成刷新显示
      dispatch('floder/flashList', null, { root: true })
      dispatch('list/flashList', {}, { root: true })

      commit('update_isSyncing', false)
    } catch (err) {
      console.log(err)
      commit('update_isSyncing', false)
    }
    /**
     * 纯promise版本
     */
    // userModel.getLastSC(uid).then(({ lastSC }) => {
    //   // 只获取比上次同步后更新的
    //   return axios
    //     .get(server + '/user/getLastSyncCount')
    //     .then(data => {
    //       const serverSC = data.SC
    //       const localSC = lastSC
    //       if (serverSC > localSC) {
    //         return dispatch('pull', { localSC, serverSC })
    //       }
    //       return dispatch('push')
    //     })
    //     .then(() => {
    //       commit('update_isSyncing', false)
    //     })
    //     .catch(err => {
    //       console.log(err)
    //       commit('update_isSyncing', false)
    //     })
    // })
  },

  pull({ dispatch, rootState }, { localSC, serverSC }) {
    const uid = rootState.user.id
    return dispatch('_pullNotebooks', localSC)
      .then(() => dispatch('_pullNotes', localSC))
      .then(() => userModel.update(uid, { lastSC: serverSC }))
      .then(() => dispatch('push'))
  },

  async push({ dispatch }) {
    try {
      await dispatch('_pushNotebooks')
      await dispatch('_pushNotes')
    } catch (err) {
      if (err.rePull) {
        // push过程中出现另一客户端对服务端进行了修改，需要重新pull
        setTimeout(() => {
          dispatch('sync')
        }, 10000)
      }
      return Promise.reject(err)
    }
  },

  // 内部调用
  _pullNotebooks({ dispatch, rootState }, afterSC) {
    const server = rootState.user.server
    const uid = rootState.user.id
    return axios
      .get(`${server}/notebook/getSync?afterSC=${afterSC}&maxCount=10`)
      .then(data => {
        const notebooks = data.notebooks
        console.log(notebooks)
        if (notebooks.length > 0) {
          dispatch('_updateNotebooksToLocal', notebooks)
        }
        if (notebooks.length == 10) {
          return dispatch('_pullNotebooks', {
            uid,
            afterSC: notebooks[notebooks.length - 1].SC
          })
        }
      })
  },

  _pullNotes({ dispatch, rootState }, afterSC) {
    const server = rootState.user.server
    const uid = rootState.user.id
    return axios
      .get(`${server}/note/getSync?afterSC=${afterSC}&maxCount=20`)
      .then(data => {
        const notes = data.notes
        console.log(notes)
        if (notes.length > 0) {
          dispatch('_updateNotesToLocal', notes)
        }
        if (notes.length == 20) {
          return dispatch('_pullNotes', {
            uid,
            afterSC: notes[notes.length - 1].SC
          })
        }
      })
  },

  _updateNotebooksToLocal({ rootState }, serverData) {
    const model = notebookModel
    const uid = rootState.user.id
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
                  modifyState: 0
                })
                break
              case 1: // 代表本地新建，并且uuid冲突了，更新本地uuid即可，并且等会儿需要发送到服务端同步，暂时不需要更改modifyState
                if (server.name == local.name) {
                  model.update(local.id, {
                    guid: uuid()
                  })
                }
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
                    modifyState: 0
                  })
                }
                break
              case 3:
                //代表本地进行了删除操作，并且没有发送到服务器同步，但是服务端的数据却在另一个客户端更新了还同步了，这是用户自己逻辑不清楚，所以不考虑
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
              modifyState: 0 //0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据
            })
          }
        }
      }
    })
  },

  _updateNotesToLocal({ rootState }, serverData) {
    const model = noteModel
    const uid = rootState.user.id
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
          if (server.is_del == 1) {
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
                  modifyState: 0
                })
                break
              case 1: // 代表本地新建，并且uuid冲突了，更新本地uuid即可，并且等会儿需要发送到服务端同步，暂时不需要更改modifyState
                if (server.name == local.name) {
                  model.update(local.id, {
                    guid: uuid()
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
                  modifyDate: newModifyDate
                })
                break
              }
              case 3: //代表本地进行了删除操作，并且没有发送到服务器同步，但是服务端的数据却在另一个客户端更新了还同步了，这是用户自己逻辑不清楚，所以不考虑
                break
            }
        } else {
          // 直接添加到本地
          model.add({
            guid,
            SC,
            title,
            bid,
            content,
            addDate,
            modifyDate,
            uid,
            modifyState: 0 //0：不需要同步，1：新的东西，2：修改过的东西
          })
        }
      }
    })
  },

  /**
   * push细节
   */
  _pushNotebooks({ rootState, dispatch }) {
    console.log('sync notebooks')
    const uid = rootState.user.id
    return notebookModel.getModify(uid).then(data => {
      if (data.length > 0) {
        return dispatch('_updateNotebooksToServer', { data, count: 0 })
      }
    })
  },

  _pushNotes({ rootState, dispatch }) {
    console.log('sync notes')
    const uid = rootState.user.id
    return noteModel.getModify(uid).then(data => {
      if (data.length > 0) {
        return dispatch('_updateNotesToServer', { data, count: 0 })
      }
    })
  },

  _updateNotebooksToServer({ rootState, dispatch, commit }, { data, count }) {
    console.log(count, data.length)
    if (count >= data.length) {
      return Promise.resolve()
    }
    const server = rootState.user.server
    const uid = rootState.user.id
    let result
    const local = data[count]
    switch (local.modifyState) {
      case 1: {
        result = axios.post(`${server}/notebook/create`, local)
        break
      }
      case 2: {
        result = axios.post(`${server}/notebook/update`, local)
        break
      }
      case 3: {
        result = axios.post(`${server}/notebook/delete`, local)
        break
      }
    }
    return result.then(({ isErr, SC, isRepect }) => {
      if (isErr) {
        // 在修改过程中，另一服务端进行了修改，产生了冲突，需要重新获取新的更新并在本地解决冲突
        return Promise.reject({ rePull: true })
      } else if (isRepect) {
        //不唯一，需要修改guid重新发送改变
        data[count].guid = uuid()
        notebookModel.update(local.id, {
          guid: data[count].guid
        })
        return dispatch('_updateNotebooksToServer', {
          data,
          count
        })
      } else if (SC == rootState.user.lastSC + 1) {
        //成功的状态，更新本地lastSC和对应资源的SC
        if (local.modifyState == 3) {
          // 笔记本的删除，不代表本地的笔记已经可以被删除，所以这里只需要删除笔记本，其内的笔记会在后面的同步中删除
          console.log('delete')
          notebookModel.delete(local.id)
        } else {
          console.log('add/update')
          notebookModel.update(local.id, { SC, modifyState: 0 })
        }
        commit('user/update_lastSC', SC, { root: true })

        userModel.update(uid, { lastSC: SC })
        return dispatch('_updateNotebooksToServer', { data, count: count + 1 })
      }
    })
  },

  _updateNotesToServer({ rootState, dispatch, commit }, { data, count }) {
    console.log(count, data.length)
    if (count >= data.length) {
      return Promise.resolve()
    }
    const server = rootState.user.server
    const uid = rootState.user.id
    let result
    const local = data[count]
    switch (local.modifyState) {
      case 1: {
        result = axios.post(`${server}/note/create`, local)
        break
      }
      case 2: {
        result = axios.post(`${server}/note/update`, local)
        break
      }
      case 3: {
        result = axios.post(`${server}/note/delete`, local)
        break
      }
    }
    return result.then(({ isErr, SC, isRepect }) => {
      if (isErr) {
        // 在修改过程中，另一服务端进行了修改，产生了冲突，需要重新获取新的更新并在本地解决冲突
        return Promise.reject({ rePull: true })
      } else if (isRepect) {
        //不唯一，需要修改guid重新发送改变
        data[count].guid = uuid()
        noteModel.update(local.id, {
          guid: data[count].guid
        })
        return dispatch('_updateNotesToServer', {
          data,
          count
        })
      } else if (SC == rootState.user.lastSC + 1) {
        //成功的状态，更新本地lastSC和对应资源的SC
        if (local.modifyState == 3) {
          noteModel.delete(local.id)
        } else {
          noteModel.update(local.id, { SC, modifyState: 0 })
        }
        commit('user/update_lastSC', SC, { root: true })
        userModel.update(uid, { lastSC: SC })
        return dispatch('_updateNotesToServer', { data, count: count + 1 })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
