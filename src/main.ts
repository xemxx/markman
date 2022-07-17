import { createApp } from 'vue'
import App from './App.vue'
// import './samples/node-api'

import router from '@/router'
import store from '@/store'

import '@/plugins/sqlite3/init'
import Axios from '@/plugins/axios'
import Antd from '@/plugins/antd'
import '@/assets/css/index.styl'

// 全局拦截，检测token


const app = createApp(App)

app.config.globalProperties.$axios = Axios

app.use(router).use(store).use(Antd).mount('#app')
