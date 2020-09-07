import { createApp } from 'vue'
import router from '@/router'
import store from '@/store'
import App from '@/App.vue'
import { BootStrap } from './bootstrap'

import '@/plugins/sqlite3/init.js'
import Axios from '@/plugins/axios.js'
import Antd from '@/plugins/antd.js'

import '@/assets/css/index.styl'

const app = createApp(App)

app.config.productionTip = false
app.config.globalProperties.$axios = Axios

app.use(router).use(store).use(Antd).mount('#app')

console.log('init')
const boot = new BootStrap(app)
boot.init()
