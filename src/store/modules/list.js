import Note from '../../model/note.js'
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
  flashList(
    { commit, state, rootState, dispatch },
    { type, flagId } = {
      type: '',
      flagId: ''
    }
  ) {
    const uid = rootState.user.id
    let list = {}
    type = type ? type : state.type
    flagId = flagId ? flagId : state.flagId

    if (type === 'note') {
      list = nModel.getAllByBook(uid, flagId)
    } else if (type === 'tag') {
      list = nModel.getAllByTag(uid, flagId)
    } else if (type === 'all') {
      list = nModel.getAll(uid)
    }

    return list
      .then(notes => {
        commit('update_list', {
          type,
          flagId,
          notes: notes
        })
        if (notes[0] != undefined) {
          dispatch('editor/loadNote', notes[0].id, { root: true })
        }
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
