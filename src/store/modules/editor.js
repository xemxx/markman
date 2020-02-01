import Note from '../../model/note.js'
import uuid from 'uuid/v1'

const nModel = new Note()

const state = {
  detail: { id: '', markdown: '', title: '' },
  tags: []
}

const mutations = {
  update_detail(state, value) {
    state.detail = value
  },
  update_title(state, value) {
    state.detail.title = value
  },
  update_tags(state, value) {
    state.tags = value
  },
  update_markdown(state, value) {
    state.detail.markdown = value
  }
}

const actions = {
  // 加载编辑区域数据
  loadNote({ commit }, id) {
    // 获取到detail，直接在视图绑定detail
    return nModel.get(id).then(data => {
      const detail = {
        id: data.id,
        markdown: data.content,
        title: data.title,
        modifyState: data.modifyState
      }
      commit('update_detail', detail)
      commit('update_tags', '')
    })
  },

  addNote({ rootState, dispatch }, bid) {
    const time = Date.parse(new Date()) / 1000
    const note = {
      uid: rootState.user.id,
      guid: uuid(),
      bid,
      title: '未命名',
      content: '',
      modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
      SC: 0, //新建时该值无用
      addDate: time,
      modifyDate: time
    }
    return nModel
      .add(note)
      .then(id => {
        dispatch('list/flashList', {}, { root: true })
        dispatch('loadNote', id)
      })
      .catch(err => console.log(err))
  },

  async saveNote({ dispatch, state }) {
    const { markdown: content, id, title } = state.detail
    if (id == undefined || id == '') {
      return
    }
    const { modifyState } = await nModel.get(id)
    const time = Date.parse(new Date()) / 1000
    const data = {
      content,
      title,
      modifyState: modifyState == 0 ? 2 : modifyState, //如果是同步过的代表被修改需要同步，否则都是原来的样子，新建不变，
      modifyDate: time
    }

    return nModel
      .update(id, data)
      .then(() => {
        //更新显示
        dispatch('list/flashList', {}, { root: true })
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
