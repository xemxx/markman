
import Notebook from '../../model/notebook.js'

const state = {
    notebooks: {},
    select: 0,
    model: new Notebook
};

const mutations = {
    update_notebooks(state, value) {
        state.notebooks = value
    }
}
const actions = {
    getNotebooks({ state, commit, rootState }) {
        return state.model.getNotebooks(rootState.user.uid).then(
            (notebooks) => {
                commit('update_notebooks', notebooks)
            }
        ).catch(err => { console.log(err) })
    },
    addNotebook({ state, commit, rootState }, name) {
        let time = Date.parse(new Date()) / 1000
        return state.model.add({ uid: rootState.user.uid, name: name, isModify: 1, SC: -1, sort: 'desc addDate', sortType: 'desc addDate', addDate: time, modifyDate: time }).then(() => {
            commit('sync/sendChange', null, { root: true })
        }).catch(err => console.log(err))
    },
    change({ state, commit }, params) {
        return state.model.change(params.id, params.data).then(() => {
            commit('sync/sendChange', null, { root: true })
        }).catch(err => console.log(err))
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
}