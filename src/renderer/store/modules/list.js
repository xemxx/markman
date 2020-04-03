import Note from '@/model/note.js'
const nModel = new Note()

const state = {
  type: 'all',
  flagId: '',
  notes: ''
}

const mutations = {
  update_list(state, { type, flagId, notes }) {
    state.type = type ? type : state.type
    state.flagId = flagId ? flagId : state.tid
    state.notes = notes ? notes : state.notes
  }
}

const actions = {
  //更新state中的list，视图将自动更新
  flash(
    { commit, rootState },
    { type = state.type, flagId = state.flagId } = {}
  ) {
    const uid = rootState.user.id
    let list = {}

    if (type === 'note') {
      list = nModel.getAllByBook(uid, flagId)
    } else if (type === 'tag') {
      list = nModel.getAllByTag(uid, flagId)
    } else if (type === 'all') {
      list = nModel.getAll(uid)
      flagId = ''
    }

    return list
      .then(notes => {
        commit('update_list', {
          type,
          flagId,
          notes: notes
        })
      })
      .catch(err => console.log(err))
  },
  moveNote({ dispatch }, { id, bid }) {
    return nModel
      .update(id, { bid, modifyState: 2 })
      .then(() => {
        dispatch('sync/sync', null, { root: true })
        dispatch('flash')
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
