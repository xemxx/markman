import Sync from "../../model/sync.js";

const state = {
  //同步状态
  isSyncing: false,
  model: new Sync()
};

const mutations = {
  update_isSyncing(state, value) {
    state.isSyncing = value;
  }
};

const actions = {
  fullSync() {
    //TODO 全量同步
  },
  incrementalSync({ commit }) {
    //TODO 增量同步
    commit("update_isSyncing", true);
  },
  sendChange({ commit }) {
    //TODO 发送改变
    commit("update_isSyncing", true);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
