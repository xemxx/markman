import router from '@/router'
import store from '@/store'
import axios from '@/plugins/axios'

const expir_time = 60 * 60 * 24 * 60

export class BootStrap {
  constructor() {}
  init() {
    this.initLoginStatus()
    //this.initRouter()
  }
  initRouter() {
    // 全局拦截，检测token
    router.beforeEach((to, from, next) => {
      if (to.matched.some(m => m.meta.auth)) {
        if (store.state.user.token === '') {
          next({
            path: '/sign/in',
          })
        } else {
          next()
        }
      } else {
        next()
      }
    })
  }
  async initLoginStatus() {
    try {
      const ustate = store.state.user
      ;(await user).loadActiver()

      //先自身解析token是否超时
      let data = JSON.parse(
        decodeURIComponent(escape(window.atob(ustate.token.split('.')[1]))),
      )
      if (data.exp < Date.parse(Date()) / 1000) {
        // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
        this.logout()
        return
      }
      if (data.exp - Date.parse(Date()) / 1000 > expir_time / 2) {
        // 代表在60天的前30天，不需要刷新token
        return
      }
      // 代表在60天的后30天，需要刷新token
      if (!store.state.online) {
        //断网，则可使用最多30天，在30天内必须刷新token，否则将失效
        return
      }
      // 刷新token
      try {
        const data = await axios.post(ustate.server + '/user/flashToken')
        //刷新成功，直接进入
        user.flashToken(data.token)
        return
      } catch (res) {
        //处理请求时原有token出现问题，可能数据被串改，需要重新登录
        if (res.status == 200 && res.data.code != 200) {
          // 确认不是网络问题后重新登陆
          this.logout()
          return
        }
      }
    } catch (err) {
      this.logout()
      return
    }
  }

  logout() {
    user.unSetActiver()
    router.push('/sign/in')
  }
}
