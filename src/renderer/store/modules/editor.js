import Note from '@/model/note.js'
import uuid from 'uuid/v1'
import { MessageBox } from 'element-ui'

const nModel = new Note()

const autoSaveTimers = new Map()

const defaultNote = {
  id: '',
  content: '',
  title: '',
  modifyState: 0,
  modifyDate: '',
  SC: 0
}

const state = {
  isEdit: true,
  detail: defaultNote,
  modify: false
}

const mutations = {
  update_detail(state, value) {
    state.detail = value
    state.modify = false
  },
  update_title(state, value) {
    state.detail.title = value
    state.modify = true
  },
  update_content(state, value) {
    state.detail.content = value
    state.modify = true
  },
  update_modify(state, value) {
    state.modify = value
  }
}

const actions = {
  // 加载编辑区域数据
  async loadNote({ commit, state, dispatch }, id = state.detail.id) {
    const oldId = state.detail.id
    try {
      if (oldId != id && oldId != undefined) {
        // 处理自动保存定时器
        if (autoSaveTimers.has(oldId)) {
          clearTimeout(autoSaveTimers.get(oldId))
          autoSaveTimers.delete(oldId)
          // 立即保存
          await dispatch('saveNote', state.detail)
        }
      }
      // 获取到detail，直接在视图绑定detail
      const data = await nModel.get(id)
      if (data == undefined) return

      if (oldId != id) return commit('update_detail', data)

      // oldId==id 需要判断是否刷新加载
      if (data.SC == state.detail.SC) return

      // 本地无改变，更新当前内容
      if (!state.modify) commit('update_detail', data)
      // 本地改变，并且远端有更新到本地的内容，出现冲突
      else await dispatch('__fixConflect')
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

  async saveNote(
    { dispatch, state, commit },
    { content, id, title, SC } = state.detail
  ) {
    if (id == undefined || id == '') {
      return
    }
    const origin = await nModel.get(id)
    if (origin.content == content && origin.title == title) {
      return
    }
    if (origin.SC != SC) {
      console.log(123)
      return await dispatch('__fixConflect')
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
        commit('update_modify', false)
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
        commit('update_detail', defaultNote)
      }
    })
    //同步服务器
    dispatch('sync/sync', undefined, { root: true })
  },

  handleAutoSave(
    { state, rootState, dispatch },
    { id, title, content, SC } = state.detail
  ) {
    const { autoSave, autoSaveDelay } = rootState.preference
    if (autoSave) {
      if (autoSaveTimers.has(id)) {
        clearTimeout(autoSaveTimers.get(id))
        autoSaveTimers.delete(id)
      }
      const timeFunc = setTimeout(async () => {
        await dispatch('saveNote', { id, title, content, SC })
        autoSaveTimers.delete(id)
      }, autoSaveDelay)
      autoSaveTimers.set(id, timeFunc)
    }
  },

  __fixConflect({ state, dispatch, commit }) {
    console.log(
      '当前笔记服务端有更新，请选择：\n1、保留双方并解决冲突\n2、放弃当前修改，远端覆盖本地'
    )
    MessageBox.confirm(
      '当前笔记服务端有更新，请选择：\n1、保留双方并解决冲突\n2、放弃当前修改，远端覆盖本地',
      '提示',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '1、保留',
        cancelButtonText: '2、放弃'
      }
    )
      .then(async () => {
        let local = state.detail
        let server = await nModel.get(local.id)
        let newTitle = `local:${local.title} [---] server:${server.title}`
        let newContent = `local>>>>>>>>>>>>>>\n${local.content}\n [---------------------------------]\n server:>>>>>>>>>>>>>>>>\n${server.content}`
        let newModifyDate = Date.parse(new Date()) / 1000
        return nModel
          .update(local.id, {
            title: newTitle,
            content: newContent,
            modifyDate: newModifyDate,
            modifyState: 2
          })
          .then(() => {
            //更新显示
            dispatch('list/flash', undefined, { root: true })
            local.title = newTitle
            local.content = newContent
            local.modifyState = 2
            local.SC = server.SC
            local.modifyDate = newModifyDate
            commit('update_detail', local)
          })
          .catch(err => console.log(err))
      })
      .catch(async () => {
        const data = await nModel.get(state.detail.id)
        commit('update_detail', data)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
