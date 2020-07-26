import Note from '@/model/note.js'
import uuid from 'uuid/v1'

const nModel = new Note()

const autoSaveTimers = new Map()

const detailNote = {
  id: '',
  content: '',
  title: '',
  modifyState: 0,
  modifyDate: ''
}

const state = {
  isEdit: true,
  detail: detailNote,
  modify: false
}

const mutations = {
  update_detail(state, value) {
    state.detail = value
  },
  update_title(state, value) {
    state.detail.title = value
  },
  update_content(state, value) {
    state.detail.content = value
  }
}

const actions = {
  // 加载编辑区域数据
  async loadNote({ commit, state, dispatch }, id = state.detail.id) {
    const oldId = state.detail.id
    if (oldId == id || (oldId == '' && id == '') || oldId == undefined) {
      return
    }
    try {
      // 处理自动保存定时器
      if (autoSaveTimers.has(oldId)) {
        clearTimeout(autoSaveTimers.get(oldId))
        autoSaveTimers.delete(oldId)
        // 立即保存
        await dispatch('saveNote')
      }
      // 获取到detail，直接在视图绑定detail
      const data = await nModel.get(id)
      commit('update_detail', data)
    } catch (err) {
      console.log(err)
    }
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
        dispatch('list/flash', {}, { root: true })
        dispatch('loadNote', id)
      })
      .catch(err => console.log(err))
  },

  async saveNote({ dispatch, state }, sync = false) {
    const { content, id, title } = state.detail
    if (id == undefined || id == '') {
      return
    }
    const origin = await nModel.get(id)
    if (origin.content == content && origin.title == title) {
      return
    }
    const { modifyState } = origin
    const time = Date.parse(new Date()) / 1000
    const data = {
      content,
      title,
      modifyState: modifyState == 0 ? 2 : modifyState, //如果是同步过的代表被修改需要同步，否则就是新建不变
      modifyDate: time
    }

    return nModel
      .update(id, data)
      .then(() => {
        //更新显示
        dispatch('list/flash', undefined, { root: true })
        //同步服务器
        if (sync) dispatch('sync/sync', undefined, { root: true })
      })
      .catch(err => console.log(err))
  },

  async deleteNote({ dispatch, state, commit }, id) {
    try {
      const { modifyState } = await nModel.get(id)
      if (modifyState == 1) {
        await nModel.delete(id)
      } else {
        const time = Date.parse(new Date()) / 1000
        const data = {
          modifyState: 3,
          modifyDate: time
        }
        await nModel.update(id, data)
      }
    } catch (err) {
      console.log(err)
    }
    //更新显示
    dispatch('list/flash', {}, { root: true }).then(() => {
      if (id == state.detail.id) {
        commit('update_detail', detailNote)
      }
    })
    //同步服务器
    dispatch('sync/sync', undefined, { root: true })
  },

  handleAutoSave(
    { state, rootState, dispatch },
    { id, title, content } = state.detail
  ) {
    const { autoSave, autoSaveDelay } = rootState.preference
    if (autoSave) {
      if (autoSaveTimers.has(id)) {
        clearTimeout(autoSaveTimers.get(id))
        autoSaveTimers.delete(id)
      }
      const timeFunc = setTimeout(async () => {
        try {
          const origin = await nModel.get(id)
          if (origin.content == content && origin.title == title) {
            return
          }
          const { modifyState } = origin
          const time = Date.parse(new Date()) / 1000
          const data = {
            content,
            title,
            modifyState: modifyState == 0 ? 2 : modifyState, //如果是同步过的代表被修改需要同步，否则就是新建不变
            modifyDate: time
          }

          await nModel.update(id, data)
          dispatch('list/flash', undefined, { root: true })
        } catch (err) {
          console.log(err)
        }
        autoSaveTimers.delete(id)
      }, autoSaveDelay)
      autoSaveTimers.set(id, timeFunc)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
