// import Sync from "../../model/sync.js";

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
  incrementalSync({ commit }) {
    //TODO 增量同步
    commit('update_isSyncing', true)
    setTimeout(() => {
      commit('update_isSyncing', false)
    }, 10000)
  },
  sendChange({ commit }) {
    //TODO 发送改变
    commit('update_isSyncing', true)
    setTimeout(() => {
      commit('update_isSyncing', false)
    }, 10000)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
