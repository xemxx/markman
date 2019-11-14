
import { getCookie, setCookie } from '../../tools/function.js';

const state = {
    token: getCookie('token') ? getCookie('token') : '',
    username: "xem"
};

const mutations = {
    //login_update_avatar(state, value) { state.avatar = value; },
    login_update_token(state, value) {
        setCookie('token', value);
        state.token = value;
    }
};

const actions = {};

export default {
    state,
    mutations,
    actions
}