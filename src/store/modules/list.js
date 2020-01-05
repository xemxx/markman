import List from "../../model/list.js";
const state = {
  type: "all",
  tid: "",
  data: "",
  model: new List()
};

const mutations = {
  update_list(state, { type, tid, data }) {
    state.type = type;
    state.tid = tid;
    state.data = data;
  }
};

const actions = {
  // 更新list，vue将自动更新到视图
  showList(
    { commit, state, rootState },
    { type, tid } = { type: "", tid: "" }
  ) {
    let uid = rootState.user.uid;
    let list = {};
    type = type ? type : state.type;
    tid = tid ? tid : state.tid;
    if (type === "note") {
      list = state.model.getNotesByBook(uid, tid);
    } else if (type === "tag") {
      list = state.model.getNotesByTag(uid, tid);
    } else if (type === "all") {
      list = state.model.getAllNotes(uid);
    }
    return list
      .then(notes => {
        // 同步更新list
        commit("update_list", { type, tid, data: notes });
      })
      .catch(err => console.log(err));
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
