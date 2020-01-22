import Notebook from "../../model/notebook.js";

const model = new Notebook();
const state = {
  notebooks: {}
};

const mutations = {
  update_notebooks(state, value) {
    state.notebooks = value;
  }
};
const actions = {
  flashList({ commit, rootState }) {
    return model
      .getAll(rootState.user.id)
      .then(notebooks => {
        commit("update_notebooks", notebooks);
      })
      .catch(err => {
        console.log(err);
      });
  },
  addOne({ dispatch, rootState }, name) {
    let time = Date.parse(new Date()) / 1000;
    return model
      .addOne({
        uid: rootState.user.id,
        name: name,
        guid: Date.parse(new Date()) + rootState.user.id,
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: -1, //暂时不用
        sort: 1, //暂时不用
        sortType: 1, //暂时不用
        addDate: time,
        modifyDate: time
      })
      .then(() => {
        //更新列表显示
        dispatch("flashList");
        //同步服务器
        dispatch("sync/sendChange", null, { root: true });
      })
      .catch(err => console.log(err));
  },
  update({ dispatch }, params) {
    return model
      .updateById(params.id, params.data)
      .then(() => {
        //更新列表显示
        dispatch("flashList");
        //同步服务器
        dispatch("sync/sendChange", null, { root: true });
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
