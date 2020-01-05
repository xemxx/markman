import Note from "../../model/note.js";
//import { hasKeys } from "../../tools";

const state = {
  detail: {
    markdown: "",
    title: ""
  },
  tags: {},
  model: new Note()
};

const mutations = {
  update_detail(state, value) {
    state.detail = value;
  },
  update_tags(state, value) {
    state.tags = value;
  },
  set_markdown(state, value) {
    state.detail.markdown = value;
    state.detail.title = "123";
  }
};

const actions = {
  // 加载编辑区域数据
  showNote({ commit, state }, { id }) {
    // 获取到detail，直接在视图绑定detail.content
    return state.model
      .getNote(id)
      .then(note => {
        commit("update_detail", note);
        return state.model.getNote.getTags(id);
      })
      .then(tags => {
        commit("update_tags", tags);
      })
      .catch(err => console.log(err));
  },
  updateNoteSelf({ state, dispatch }, params) {
    return state.model
      .update(params.id, params.data)
      .then(() => {
        //更新显示
        if (params.data.bid != "") {
          dispatch("notebook/showNotebooks", null, { root: true });
        }
        dispatch("list/showList", null, { root: true });
        //同步服务器
        dispatch("sync/sendChange", null, { root: true });
      })
      .catch(err => console.log(err));
  },
  listen_editor_save() {
    // window.addEventListener("keyup", () =>
    //   store.commit("update_online", true)
    // );
  },
  listen_for_markdown_change({ commit }, { markdown }) {
    commit("set_markdown", markdown);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
