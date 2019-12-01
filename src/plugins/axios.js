import axios from "axios"

import Vue from 'vue'

axios.defaults.withCredentials = false;

Vue.prototype.$axios = axios;