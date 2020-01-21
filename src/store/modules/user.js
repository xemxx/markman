import User from "../../model/user.js";
import { getCookie, setCookie } from "../../tools";

const model = new User()

const state = {
  id: getCookie("uid") ? getCookie("uid") : "",
  token: getCookie("token") ? getCookie("token") : "",
  username: getCookie("username") ? getCookie("username") : "",
  server: getCookie("server") ? getCookie("server") : ""
};

const mutations = {
  update_id(state, value) {
    setCookie("uid", value);
    state.id = value;
  },
  update_token(state, value) {
    setCookie("token", value);
    state.token = value;
  },
  update_username(state, value) {
    setCookie("username", value);
    state.username = value;
  },
  update_server(state, value) {
    setCookie("server", value);
    state.url = value;
  }
};

const actions = {
  init_activer({ commit }) {
    return model.getActiver().then(user => {
      if (user != undefined) {
        commit("update_id", user.id);
        commit("update_token", user.token);
        commit("update_server", user.server);
        commit("update_username", user.username);
        return true;
      } else {
        commit("update_id", "");
        commit("update_token", "");
        commit("update_server", "");
        commit("update_username", "");
        return false;
      }
    });
  },

  flash_token({ state, commit }, token) {
    model.update(state.id, { token: "token" });
    commit("update_token", token)
  },

  unset_activer({ state, commit }) {
    model.updateState(state.id, { state: 0 });
    commit("user/update_token", "");
  },

  set_activer({ commit }, user) {
    return model.existUser(user.user, user.server).then((id) => {
      //修改数据库
      if (id !== "") {
        // 设置本地活动用户
        model.updateById(id,{state:1});
        commit("update_id", id);
      } else {
        model.createUser(user.user, user.server, user.token);
      }
      //修改state
      commit("update_token", user.token);
      commit("update_username", user.user);
      commit("update_server", user.server);
    })
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
