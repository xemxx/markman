import User from "../../model/user.js";
import { getCookie, setCookie } from "../../tools";

const model = new User();

const state = {
  id: getCookie("uid") ? getCookie("uid") : "",
  token: getCookie("token") ? getCookie("token") : "",
  username: getCookie("username") ? getCookie("username") : "",
  server: getCookie("server") ? getCookie("server") : "",
  lastSC: getCookie("SC") ? getCookie("SC") : ""
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
    state.server = value;
  },
  update_lastSC(state, value) {
    setCookie("lastSC", value);
    state.lastSC = value;
  }
};

const actions = {
  loadActiver({ commit, state }) {
    if (state.token != "") {
      return Promise.resolve(true);
    }
    return model.getActiver().then(user => {
      if (user != undefined) {
        commit("update_id", user.id);
        commit("update_token", user.token);
        commit("update_server", user.server);
        commit("update_username", user.username);
        commit("update_lastSC", user.lastSC);
        return Promise.resolve(true);
      } else {
        return Promise.reject("not login");
      }
    });
  },

  flashToken({ state, commit }, token) {
    model.update(state.id, { token: "token" });
    commit("update_token", token);
  },

  unsetActiver({ state, commit }) {
    model.updateState(state.id, { state: 0 });
    commit("update_token", "");
  },

  setActiver({ dispatch }, user) {
    return model.existUser(user.user, user.server).then(id => {
      if (id !== "") {
        return model
          .updateById(id, { state: 1, token: user.token })
          .then(() => {
            return dispatch("loadActiver");
          })
          .catch(err => {
            console.log(err);
          });
      }
      return model
        .createUser(user.user, user.server, user.token)
        .then(() => {
          return dispatch("loadActiver");
        })
        .catch(err => {
          console.log(err);
        });
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
