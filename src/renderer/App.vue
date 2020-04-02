<template>
  <div id="app">
    <el-container>
      <el-header height="auto">
        <TitleBar />
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import TitleBar from './components/TitleBar.vue'
export default {
  name: 'app',
  components: {
    TitleBar
  },
  created() {
    // 从数据库读用户数据初始化
    let store = this.$store
    let ustate = store.state.user
    this.$store
      .dispatch('user/loadActiver')
      .then(() => {
        // 如果认定存在活动用户则进行开始判断网络状态
        // 如果可联网 刷新用户状态，向服务端获取新token
        // 默认token可使用30天，如果连续30天不登录将被取消登录状态
        if (store.state.online) {
          this.$axios
            .post(ustate.server + '/user/flashToken')
            .then(data => {
              //刷新成功
              store.dispatch('user/flashToken', data.token)
              setTimeout(() => {
                this.$router.push('/home').catch(err => err)
              }, 1000)
            })
            .catch(res => {
              //处理请求时原有token出现问题
              if (res.status == 200 && res.data.code != 200) {
                console.log(res)
                return
              }
              //认定为网络问题
              //先自身解析token是否超时，如果超时直接跳转到登录界面，否则认定为离线编辑状态
              try {
                let data = JSON.parse(
                  decodeURIComponent(
                    escape(window.atob(ustate.token.split('.')[1]))
                  )
                )
                if (data.exp > Date.parse(new Date()) / 1000) {
                  //离线编辑
                  setTimeout(() => {
                    this.$router.push('/home').catch(err => err)
                  }, 1000)
                } else {
                  //用户登录失效
                  store.dispatch('user/unSetActiver')
                  setTimeout(() => {
                    this.$router.push('/sign/in').catch(err => err)
                  }, 1000)
                }
              } catch (err) {
                //可能token被串改不符合格式导致window.atob报错
                console.log(err)
                store.dispatch('user/unSetActiver')
                setTimeout(() => {
                  this.$router.push('/sign/in').catch(err => err)
                }, 1000)
              }
            })
        }
      })
      .catch(err => {
        console.log(err)
        setTimeout(() => {
          this.$router.push('/sign/in').catch(err => err)
        }, 1000)
      })
  },
  computed: {},
  methods: {}
}
</script>

<style lang="stylus" scoped>
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
  height 100vh
  overflow hidden
</style>
