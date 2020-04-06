<template>
  <div class="layout">
    <div v-show="sidebar" class="sidebar">
      <div class="floder">
        <Floder />
      </div>
      <div class="list">
        <List />
      </div>
    </div>
    <div class="editor">
      <Editor />
    </div>
  </div>
</template>

<script>
import Floder from '@/components/Floder'
import List from '@/components/List.vue'
import Editor from '@/components/Editor'

import { mapState } from 'vuex'

export default {
  name: 'index',
  components: {
    Floder,
    List,
    Editor
  },
  data: () => {
    return {}
  },
  computed: {
    ...mapState({
      sidebar: state => state.sidebar
    })
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
            decodeURIComponent(escape(window.atob(ustate.token.split('.')[1])))
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
                    this.$router.push('/editor').catch(err => err)
                  })
                  .catch(res => {
                    //处理请求时原有token出现问题，可能数据被串改，需要重新登录
                    if (res.status == 200 && res.data.code != 200) {
                      this.logout()
                      return
                    }
                  })
              }
            }
          } else {
            // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
            this.logout()
            return
          }
        } catch (err) {
          //可能token被串改不符合格式导致window.atob报错
          this.logout()
          return
        }
      })
      .catch(() => {
        this.$router.push('/sign/in').catch(err => err)
        return
      })
    this.$store.dispatch('sync/sync')
    this.listen()
  },
  methods: {
    logout() {
      let store = this.$store
      store.dispatch('user/unSetActiver')
      this.$router.push('/sign/in').catch(err => err)
    },
    listen() {
      const { dispatch } = this.$store
      dispatch('listenSidebar')
      dispatch('listenFileSave')
      dispatch('listenPreview')
    }
  }
}
</script>
<style lang="stylus" scoped>
.layout
  display flex
  flex-direction row
  height 100%

.sidebar
  display flex
  flex 1
  max-width 400px
  min-width 100px

.floder, .list
  flex 1
  max-width 200px
  min-width 50px

.floder
  background-color floder-bc

.list
  background-color list-bc

.editor
  flex 1
</style>
