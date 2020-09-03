<template>
  <div class="editor-container">
    <TitleBar />
    <router-view class="main"></router-view>
  </div>
</template>

<script>
import TitleBar from '@/components/titleBar'
export default {
  components: {
    TitleBar,
  },
  created() {
    // 初始化editor窗口逻辑
    let store = this.$store
    let ustate = store.state.user
    this.$store
      .dispatch('user/loadActiver')
      .then(() => {
        //先自身解析token是否超时
        try {
          let data = JSON.parse(
            decodeURIComponent(escape(window.atob(ustate.token.split('.')[1]))),
          )
          if (data.exp > Date.parse(new Date()) / 1000) {
            if (data.exp - Date.parse(new Date()) / 1000 < 60 * 60 * 24 * 30) {
              // 代表在60天的后30天，需要刷新token
              if (store.state.online) {
                // 先判断网络状态，如果断网，则可使用最多30天，在30天内必须刷新token，否则将失效
                this.$axios
                  .post(ustate.server + '/user/flashToken')
                  .then(data => {
                    //刷新成功，直接进入
                    store.dispatch('user/flashToken', data.token)
                    this.$router.push('/base').catch(err => err)
                  })
                  .catch(res => {
                    //处理请求时原有token出现问题，可能数据被串改，需要重新登录
                    if (res.status == 200 && res.data.code != 200) {
                      this.logout()
                    }
                  })
              }
            } else {
              // 不需要刷新token
              this.$router.push('/base').catch(err => err)
            }
          } else {
            // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
            this.logout()
          }
        } catch (err) {
          //可能token被串改不符合格式导致window.atob报错
          this.logout()
        }
      })
      .catch(() => {
        this.$router.push('/sign/in').catch(err => err)
      })
  },
  methods: {
    logout() {
      let store = this.$store
      store.dispatch('user/unSetActiver')
      this.$router.push('/sign/in').catch(err => err)
    },
  },
}
</script>

<style lang="stylus" scoped>
.editor-container
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
  height 100vh
  overflow hidden
</style>
