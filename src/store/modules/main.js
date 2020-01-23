// import Sync from "../../model/sync.js";

const state = {
  //同步状态
  viewMode: "all" //all,focus
};

const mutations = {
  update_viewMode(state, value) {
    state.viewMode = value;
  }
};

const actions = {
    
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
