import Note from "../../model/note.js";
const nModel = new Note();
//import { hasKeys } from "../../tools";

const state = {
  detail: {
    markdown: "",
    title: ""
  },
  tags: {}
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
  loadNote({ commit }, id) {
    // 获取到detail，直接在视图绑定detail.content
    return nModel.getOne(id).then(data => {
      //console.log(id,data);
      const detail = {
        markdown: data.content,
        title: data.title
      };
      commit("update_detail", detail);
      commit("update_tags", "");
    });
  },
  addNote({ rootState, dispatch }, bid) {
    const time = Date.parse(new Date()) / 1000;
    const note = {
      uid: rootState.user.id,
      guid: Date.parse(new Date()) + rootState.user.id,
      bid,
      title: "未命名",
      content: "",
      modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
      SC: -1, //暂时不用
      addDate: time,
      modifyDate: time
    };
    return nModel
      .add(note)
      .then(id => {
        dispatch("list/flashList",null,{root:true});
        dispatch("loadNote", id);
      })
      .catch(err => console.log(err));
  },

  //TODO
  updateNoteSelf({ dispatch }, params) {
    return nModel
      .update(params.id, params.data)
      .then(() => {
        //更新显示
        if (params.data.bid != "") {
          dispatch("floder/flashList", null, { root: true });
        }
        dispatch("list/flashList", null, { root: true });
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