import Note from '../../model/note.js'
const state = {
    list: {},
    detail: {},
    model: new Note
};

const mutations = {
    note_update_list(state, value) { state.list = value; },
    note_update_detail(state, value) { state.detail = value; }
};

const actions = {
    getList({ rootState }) {
        let select = rootState
    }
};

export default {
    state,
    mutations,
    actions
}