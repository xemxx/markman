export default async function init(store) {
  loginStatus(store)
}

const loginStatus = async store => {
  try {
    const ustate = store.state.user
    await store.dispatch('user/loadActiver')

    //先自身解析token是否超时
    let data = JSON.parse(
      decodeURIComponent(escape(window.atob(ustate.token.split('.')[1]))),
    )
    if (data.exp > Date.parse(new Date()) / 1000) {
      if (data.exp - Date.parse(new Date()) / 1000 < 60 * 60 * 24 * 30) {
        // 代表在60天的后30天，需要刷新token
        if (store.state.online) {
          // 先判断网络状态，如果断网，则可使用最多30天，在30天内必须刷新token，否则将失效
          await this.$axios
            .post(ustate.server + '/user/flashToken')
            .then(data => {
              //刷新成功，直接进入
              store.dispatch('user/flashToken', data.token)
              this.$router.push('/base').catch(err => err)
            })
            .catch(res => {
              //处理请求时原有token出现问题，可能数据被串改，需要重新登录
              if (res.status == 200 && res.data.code != 200) {
                logout()
              }
            })
        }
      } else {
        // 不需要刷新token
        this.$router.push('/base').catch(err => err)
      }
    } else {
      // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
      logout()
    }
  } catch (err) {
    logout()
  }
}

function logout() {
  let store = this.$store
  store.dispatch('user/unSetActiver')
  this.$router.push('/sign/in').catch(err => err)
}
