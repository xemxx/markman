
import Notebook from '../../model/notebook.js'

const state = {
    notebooks: {},
    model: new Notebook
};

const mutations = {
    update_notebooks(state, value) {
        state.notebooks = value
    }
}
const actions = {
    showNotebooks({ state, commit, rootState }) {
        return state.model.getAll(rootState.user.uid).then(
            (notebooks) => {
                commit('update_notebooks', notebooks)
            }
        ).catch(err => { console.log(err) })
    },
    addNotebook({ state, dispatch, rootState }, name) {
        let time = Date.parse(new Date()) / 1000
        return state.model.add({ uid: rootState.user.uid, name: name, isModify: 1, SC: -1, sort: 'desc addDate', sortType: 'desc addDate', addDate: time, modifyDate: time }).then(() => {
            //更新列表显示
            dispatch('showNotebooks')
            //同步服务器
            dispatch('sync/sendChange', null, { root: true })
        }).catch(err => console.log(err))
    },
    updateNotebook({ state, dispatch }, params) {
        return state.model.update(params.id, params.data).then(() => {
            //更新列表显示
            dispatch('showNotebooks')
            //同步服务器
            dispatch('sync/sendChange', null, { root: true })
        }).catch(err => console.log(err))
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
}