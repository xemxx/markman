import Notebook from '../../model/notebook.js'
import uuid from 'uuid/v5'

const model = new Notebook()

const state = {
  notebooks: {}
}

const mutations = {
  update_notebooks(state, value) {
    state.notebooks = value
  }
}
const actions = {
  flashList({ commit, rootState }) {
    return model
      .getAll(rootState.user.id)
      .then(notebooks => {
        commit('update_notebooks', notebooks)
      })
      .catch(err => {
        console.log(err)
      })
  },

  addNotebook({ dispatch, rootState }, name) {
    const time = Date.parse(new Date()) / 1000
    return model
      .add({
        uid: rootState.user.id,
        name: name,
        guid: uuid(rootState.user.username, rootState.user.server),
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: 0, //暂时不用
        sort: 1, //暂时不用
        sortType: 1, //暂时不用
        addDate: time,
        modifyDate: time
      })
      .then(() => {
        //更新列表显示
        dispatch('flashList')
        //同步服务器
        dispatch('sync/sendChange', null, { root: true })
      })
      .catch(err => console.log(err))
  },

  deleteNotebook({ dispatch }, id) {
    return model
      .update(id, { modifyState: 3 })
      .then(() => {
        //更新列表显示
        dispatch('flashList')
        //同步服务器
        dispatch('sync/sync', null, { root: true })
      })
      .catch(err => console.log(err))
  },

  //TODO: 完成右键菜单后提供重命名功能
  updateNotebook({ dispatch }, { id, name }) {
    return model
      .update(id, { name, modifyState: 2 })
      .then(() => {
        //更新列表显示
        dispatch('flashList')
        //同步服务器
        dispatch('sync/sync', null, { root: true })
      })
      .catch(err => console.log(err))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
