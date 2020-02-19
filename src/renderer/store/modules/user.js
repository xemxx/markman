import User from '@/model/user.js'
import { getCookie, setCookie } from '../../tools'

const model = new User()

const state = {
  id: getCookie('uid') ? getCookie('uid') : '',
  token: getCookie('token') ? getCookie('token') : '',
  username: getCookie('username') ? getCookie('username') : '',
  server: getCookie('server') ? getCookie('server') : '',
  lastSC: getCookie('lastSC') ? getCookie('lastSC') : ''
}

const mutations = {
  update_id(state, value) {
    setCookie('uid', value)
    state.id = value
  },
  update_token(state, value) {
    setCookie('token', value)
    state.token = value
  },
  update_username(state, value) {
    setCookie('username', value)
    state.username = value
  },
  update_server(state, value) {
    setCookie('server', value)
    state.server = value
  },
  update_lastSC(state, value) {
    setCookie('lastSC', value)
    state.lastSC = value
  }
}

const actions = {
  loadActiver({ commit }) {
    return model.getActiver().then(user => {
      if (user != undefined) {
        commit('update_id', user.id)
        commit('update_token', user.token)
        commit('update_server', user.server)
        commit('update_username', user.username)
        commit('update_lastSC', user.lastSC)
        return Promise.resolve()
      } else {
        return Promise.reject('not login')
      }
    })
  },

  flashToken({ state, commit }, token) {
    model.update(state.id, { token })
    commit('update_token', token)
  },

  unsetActiver({ state, commit }) {
    model.update(state.id, { state: 0 })
    commit('update_token', '')
  },

  setActiver({ dispatch }, { username, token, server }) {
    return model.existUser(username, server).then(id => {
      if (id !== '') {
        return model
          .update(id, { state: 1, token })
          .then(() => {
            return dispatch('loadActiver')
          })
          .catch(err => {
            console.log(err)
          })
      }
      return model
        .add({ username, server, token, state: 1, lastSC: 0 })
        .then(() => {
          return dispatch('loadActiver')
        })
        .catch(err => {
          console.log(err)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
