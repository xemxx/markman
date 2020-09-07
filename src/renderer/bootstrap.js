const expir_time = 60 * 60 * 24 * 60

export class BootStrap {
  BootStrap(app) {
    this.store = app.$store
    this.router = app.$router
    this.axios = app.$axios
  }
  init() {
    this.initLoginStatus()
    this.initRouter()
    this.router.push('/editor')
  }
  initRouter() {
    const { router, store } = this
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
    const { store, axios } = this
    try {
      const ustate = store.state.user
      await store.dispatch('user/loadActiver')

      //先自身解析token是否超时
      let data = JSON.parse(
        decodeURIComponent(escape(window.atob(ustate.token.split('.')[1]))),
      )
      if (data.exp < Date.parse(new Date()) / 1000) {
        // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
        this.logout()
        return
      }
      if (data.exp - Date.parse(new Date()) / 1000 > expir_time / 2) {
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
        store.dispatch('user/flashToken', data.token)
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
    let store = this.store
    store.dispatch('user/unSetActiver')
  }
}
