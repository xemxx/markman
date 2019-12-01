
import { getCookie, setCookie } from '../../tools/function.js';

const state = {
    token: getCookie('token') ? getCookie('token') : '',
    username: getCookie('username') ? getCookie('username') : ''
};

const mutations = {
    //login_update_avatar(state, value) { state.avatar = value; },
    update_token(state, value) {
        setCookie('token', value);
        state.token = value;
    },
    update_username(state, value) {
        setCookie('username', value);
        state.username = value;
    }
};

const actions = {};

export default {
    state,
    mutations,
    actions
}