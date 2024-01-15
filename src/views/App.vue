<template>
  <div class="editor-container">
    <TitleBar />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/titleBar.vue'
import { useUserStore } from '@/store/user'
import { useSysStore } from '@/store/sys'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
const user = useUserStore()
const store = useSysStore()
const router = useRouter()
// 初始化editor窗口逻辑
user
  .loadActiver()
  .then(() => {
    //先自身解析token是否超时
    try {
      let data = JSON.parse(window.atob(user.token!.split('.')[1]))
      if (data.exp > Date.parse(Date()) / 1000) {
        if (data.exp - Date.parse(Date()) / 1000 < 60 * 60 * 24 * 30) {
          // 代表在60天的后30天，需要刷新token
          if (store.online) {
            // 先判断网络状态，如果断网，则可使用最多30天，在30天内必须刷新token，否则将失效
            axios
              .post(user.server + '/user/flashToken')
              .then((data: any) => {
                //刷新成功，直接进入
                user.flashToken(data.token)
                router.push('/editorBase').catch(err => err)
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
          router.push('/editorBase').catch(err => err)
        }
      } else {
        // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
        logout()
      }
    } catch (err) {
      //可能token被串改不符合格式导致window.atob报错
      logout()
    }
  })
  .catch(() => {
    router.push('/sign/in').catch(err => err)
  })

const logout = () => {
  user.unSetActiver()
  router.push('/sign/in').catch(err => err)
}
</script>

<style lang="stylus" scoped>
.editor-container
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
  overflow auto
  height 100vh
</style>
