// import Sync from "../../model/sync.js";
import axios from '../../plugins/axios'
import User from '../../model/user'
import Note from '../../model/note'

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
  fullSync({ commit }) {
    //TODO 全量同步
    commit('update_isSyncing', true)
    setTimeout(() => {
      commit('update_isSyncing', false)
    }, 10000)
  },
  incrementalSync({ commit, dispatch, rootState }) {
    //TODO 增量同步
    commit('update_isSyncing', true)
    const uid = rootState.user.id
    userModel
      .getLastSC(uid)
      .then(data => {
        return dispatch('_syncNotebooksToLocal', { uid, lastSC: data.lastSC })
      })
      .then(data => {
        return dispatch('_syncNotesToLocal', { uid, lastSC: data.lastSC })
      })
      .then(() => {
        return axios.post('user/getLastSyncCount')
      })
      .then(data => {
        const serverSC = data.lastSC
        return userModel.updateLastSC(uid, serverSC)
      })
      .then(() => {
        dispatch('sendChange')
        commit('update_isSyncing', false)
      })
      .catch(err => {
        console.log(err)
        commit('update_isSyncing', false)
      })
  },
  sendChange({ commit }) {
    //TODO 发送改变
    commit('update_isSyncing', true)
    setTimeout(() => {
      commit('update_isSyncing', false)
    }, 10000)
  },

  _syncNotebooksToLocal({ dispatch }, { uid, lastSC }) {
    return axios
      .post('notebook/getSyncNotebooks', {
        lastSC: lastSC,
        maxCount: 10
      })
      .then(data => {
        userModel.updateToLocal(uid, data.notebooks)
        if (data.notebooks.length == 10) {
          return dispatch('_syncNotebooksToLocal', { uid, lastSC })
        }
      })
  },

  _syncNotesToLocal({ dispatch }, { uid, lastSC }) {
    return axios
      .post('note/getSyncNotes', {
        lastSC: lastSC,
        maxCount: 20
      })
      .then(data => {
        noteModel.updateToLocal(uid, data.notes)
        if (data.notes.length == 20) {
          return dispatch('_syncNotesToLocal', { uid, lastSC })
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
