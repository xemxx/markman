import Notebook from '@/model/notebook.js'
import uuid from 'uuid/v1'

const model = new Notebook()

const state = {
  notebooks: []
}

const mutations = {
  update_notebooks(state, value) {
    state.notebooks = value
  }
}
const actions = {
  flash({ commit, rootState }) {
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
        guid: uuid(),
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: 0, //暂时不用
        sort: 1, //暂时不用
        sortType: 1, //暂时不用
        addDate: time,
        modifyDate: time
      })
      .then(() => {
        //更新列表显示
        dispatch('flash')
        //同步服务器
        dispatch('sync/sync', null, { root: true })
      })
      .catch(err => console.log(err))
  },

  deleteNotebook({ dispatch }, id) {
    return model
      .deleteLocal(id)
      .then(() => {
        //更新列表显示
        dispatch('flash')
        //同步服务器
        dispatch('sync/sync', null, { root: true })
      })
      .catch(err => console.log(err))
  },

  updateNotebook({ dispatch, state }, { id, name }) {
    const { modifyState } = state.notebooks.find(item => id === item.id)
    if (name != '') {
      return model
        .update(id, {
          name,
          modifyState: modifyState === 0 ? 2 : modifyState
        })
        .then(() => {
          //更新列表显示
          dispatch('flash')
          //同步服务器
          dispatch('sync/sync', null, { root: true })
        })
        .catch(err => console.log(err))
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
