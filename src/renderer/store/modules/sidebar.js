import Notebook from '@/model/notebook.js'
import Note from '@/model/note.js'
import uuid from 'uuid/v1'

const model = new Notebook()

const nModel = new Note()

const state = {
  notebooks: [],
  type: 'all',
  flagId: '',
  notes: '',
}

const mutations = {
  update_notebooks(state, value) {
    state.notebooks = value
  },
  update_notes(state, { type, flagId, notes }) {
    state.type = type ? type : state.type
    state.flagId = flagId ? flagId : state.tid
    state.notes = notes ? notes : state.notes
  },
}
const actions = {
  loadNotebooks({ commit, rootState }) {
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
        modifyDate: time,
      })
      .then(() => {
        //更新列表显示
        dispatch('loadNotebooks')
        //同步服务器
        dispatch('sync/sync', null, { root: true })
      })
      .catch(err => console.log(err))
  },

  deleteNotebook({ dispatch, state }, id) {
    let guid = 0
    for (let i = 0; i < state.notebooks.length; i++) {
      if (state.notebooks[i].id == id) {
        guid = state.notebooks[i].guid
      }
    }
    return model
      .deleteLocal(id, guid)
      .then(() => {
        //更新列表显示
        dispatch('loadNotebooks')
        if (state.type != 'all' && state.flagId == guid) {
          dispatch('sidebar/loadNotes', { type: 'all' }, { root: true })
        }
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
          modifyState: modifyState === 0 ? 2 : modifyState,
        })
        .then(() => {
          //更新列表显示
          dispatch('loadNotebooks')
          //同步服务器
          dispatch('sync/sync', null, { root: true })
        })
        .catch(err => console.log(err))
    }
  },

  //更新state中的list，视图将自动更新
  loadNotes({ commit, rootState, state }, { type, flagId } = state) {
    const uid = rootState.user.id
    let list = {}
    if (type === 'note') {
      list = nModel.getAllByBook(uid, flagId)
    } else if (type === 'tag') {
      list = nModel.getAllByTag(uid, flagId)
    } else if (type === 'all') {
      list = nModel.getAll(uid)
      flagId = ''
    } else {
      return
    }

    return list
      .then(notes => {
        commit('update_notes', {
          type,
          flagId,
          notes: notes,
        })
      })
      .catch(err => console.log(err))
  },

  moveNote({ dispatch }, { id, bid }) {
    return nModel
      .update(id, { bid, modifyState: 2 })
      .then(() => {
        dispatch('sync/sync', null, { root: true })
        dispatch('loadNotebooks')
      })
      .catch(err => console.log(err))
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
