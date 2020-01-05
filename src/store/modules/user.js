import User from "../../model/user.js";
import { getCookie, setCookie } from "../../tools";

const state = {
  uid: getCookie("uid") ? getCookie("uid") : "",
  token: getCookie("token") ? getCookie("token") : "",
  username: getCookie("username") ? getCookie("username") : "",
  server: getCookie("server") ? getCookie("server") : "",
  model: new User()
};

const mutations = {
  update_uid(state, value) {
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
  init({ state, commit }) {
    return state.model.getActiver().then(user => {
      if (user != undefined) {
        commit("update_uid", user.id);
        commit("update_token", user.token);
        commit("update_server", user.server);
        commit("update_username", user.username);
        return true;
      } else {
        commit("update_uid", "");
        commit("update_token", "");
        commit("update_server", "");
        commit("update_username", "");
        return false;
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
