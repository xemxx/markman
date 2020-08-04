import Note from '@/model/note.js'
import uuid from 'uuid/v1'
import { MessageBox } from 'element-ui'
import bus from '@/bus'

const nModel = new Note()

const autoSaveTimers = new Map()

const defaultNote = {
  id: '',
  markdown: '',
  title: '',
  modifyState: 0,
  SC: 0,
  isSave: true
}

const state = {
  isEdit: true,
  currentNote: defaultNote,
  modify: false
}

const mutations = {
  set_current_note(state, currentNote) {
    state.currentNote = currentNote
    bus.$emit('note-loaded', currentNote)
  },
  set_save_status(state, status) {
    state.currentNote.isSave = status
  },
  set_title(state, value) {
    state.currentNote.title = value
  },
  set_markdown(state, value) {
    state.currentNote.markdown = value
  }
}

const actions = {
  // flash note when sync finish
  async flashNote({ commit, state, dispatch }) {
    const { id, isSave, SC } = state.currentNote
    try {
      const data = await nModel.get(id)
      if (data == undefined) return
      // current note has no updated
      if (data.SC == SC) return

      // flash current note from server new version
      if (isSave) {
        let current = {
          id: data.id,
          markdown: data.content,
          title: data.title,
          modifyState: data.modifyState,
          SC: data.SC,
          isSave: true
        }
        commit('set_current_note', current)
      }

      // local has changed and server has changed too,need fixconflect
      else await dispatch('__fixConflect')
    } catch (err) {
      console.log(err)
    }
  },

  // click note to load note from sqlite
  async loadNote({ commit, state, dispatch }, id) {
    const { id: oldId, isSave } = state.currentNote
    if (id == oldId) {
      return
    }

    try {
      // close and save old note
      if (oldId != id && oldId != undefined) {
        if (autoSaveTimers.has(oldId)) {
          clearTimeout(autoSaveTimers.get(oldId))
          autoSaveTimers.delete(oldId)
          if (!isSave) await dispatch('saveNote', state.currentNote)
        }
      }

      // load new note
      const data = await nModel.get(id)
      if (data == undefined) return

      let current = {
        id: data.id,
        markdown: data.content,
        title: data.title,
        modifyState: data.modifyState,
        SC: data.SC,
        isSave: true
      }

      commit('set_current_note', current)
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
        dispatch('sidebar/loadNotes', {}, { root: true })
        dispatch('loadNote', id)
      })
      .catch(err => console.log(err))
  },

  // save note to sqlite
  async saveNote(
    { dispatch, state, commit },
    { markdown, id, title, SC, isSave } = state.currentNote
  ) {
    if (id == undefined || id == '') {
      return
    }
    if (isSave) {
      return
    }
    const origin = await nModel.get(id)
    if (origin.content == markdown && origin.title == title) {
      return
    }
    // server have new version and local note be changed
    if (origin.SC != SC) {
      return await dispatch('__fixConflect')
    }
    // update sqlite
    const { modifyState } = origin
    const time = Date.parse(new Date()) / 1000
    const data = {
      content: markdown,
      title,
      modifyState: modifyState == 0 ? 2 : modifyState,
      modifyDate: time
    }

    return nModel
      .update(id, data)
      .then(() => {
        //更新显示
        dispatch('sidebar/loadNotes', undefined, { root: true })
        commit('update_save_status', true)
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
    dispatch('sidebar/loadNotes', undefined, { root: true }).then(() => {
      if (id == state.currentNote.id) {
        commit('set_current_note', defaultNote)
      }
    })
    //同步服务器
    dispatch('sync/sync', undefined, { root: true })
  },

  // listen the content change and apply to state
  listenContentChange({ dispatch, commit, state }, { content }) {
    if (content != state.currentNote.markdown) {
      commit('set_save_status', false)
    }
    commit('set_markdown', content)
    dispatch('handleAutoSave', { markdown: content })
  },

  handleAutoSave(
    { state, rootState, dispatch },
    { id, title, markdown, SC } = state.currentNote
  ) {
    const { autoSave, autoSaveDelay } = rootState.preference
    if (autoSave) {
      if (autoSaveTimers.has(id)) {
        clearTimeout(autoSaveTimers.get(id))
        autoSaveTimers.delete(id)
      }
      const timeFunc = setTimeout(async () => {
        await dispatch('saveNote', { id, title, markdown, SC })
        autoSaveTimers.delete(id)
      }, autoSaveDelay)
      autoSaveTimers.set(id, timeFunc)
    }
  },

  //TODO: no feel to conflect
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
        let local = state.currentNote
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
            dispatch('sidebar/loadNotes', undefined, { root: true })
            local.title = newTitle
            local.markdown = newContent
            local.modifyState = 2
            local.SC = server.SC
            local.isSave = true
            commit('set_current_note', local)
          })
          .catch(err => console.log(err))
      })
      .catch(async () => {
        const data = await nModel.get(state.currentNote.id)
        let current = {
          id: data.id,
          markdown: data.content,
          title: data.title,
          modifyState: data.modifyState,
          SC: data.SC,
          isSave: true
        }
        commit('set_current_note', current)
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
