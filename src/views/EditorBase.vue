<template>
  <div class="h-screen">
    <TitleBar />
    <a-flex class="container">
      <Sidebar />
      <a-flex v-if="!editorS.isEdit" class="default-view">
        <h1>Welcome</h1>
      </a-flex>
      <a-flex vertical class="editor" v-else>
        <div>
          <input v-model="title" class="editor-title" />
        </div>
        <a-flex class="editor-wrapper">
          <MarkDown
            :value="editorS.currentNote.content"
            @change="handleChange"
            placeholder="请输入内容"
          />
        </a-flex>
        <div class="tags">tags</div>
      </a-flex>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import MarkDown from '@/components/MarkDown/Markdown.vue'
import TitleBar from '@/components/titleBar.vue'
import { usePreferenceStore } from '@/store/preference'
import { useListenStore } from '@/store/listen'
import { useSyncStore } from '@/store/sync'
import { useEditorStore } from '@/store/editor'
import { computed, onUnmounted } from 'vue'
import { emitter } from '@/emitter'
import { Modal } from 'ant-design-vue'

import http from '@/plugins/axios'

import { message } from 'ant-design-vue'
import { useSysStore } from '@/store/sys'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const editorS = useEditorStore()

const title = computed({
  get: function () {
    return editorS.currentNote.title
  },
  set: function (newVal) {
    editorS.updateTitle(newVal)
  },
})
const handleChange = (value: string) => {
  editorS.updateContent(value)
}
const showCloseQuery = (id: any) => {
  Modal.confirm({
    content: '当前笔记改动是否保存？',
    title: '提示',
    okText: '是',
    cancelText: '否',
    onOk: async () => {
      await editorS.saveNote()
      return await editorS.loadNote(id)
    },
    onCancel: () => {
      editorS.currentNote.isSave = true
      return editorS.loadNote(id)
    },
  })
}

const user = useUserStore()
const router = useRouter()
const store = useSysStore()
const preference = usePreferenceStore()
const listen = useListenStore()
const sync = useSyncStore()

// 初始化editor窗口逻辑
async function init() {
  if (user.server === '') {
    router.push('/login-setting').catch(err => err)
    return
  }
  try {
    await user.loadActiver()
    // 先自身解析token是否超时
    try {
      const data = JSON.parse(window.atob(user.token!.split('.')[1]))
      if (data.exp > Date.parse(Date()) / 1000) {
        if (data.exp - Date.parse(Date()) / 1000 < 60 * 60 * 24 * 30) {
          // 代表在60天的后30天，需要刷新token
          if (store.online) {
            // 先判断网络状态，如果断网，则可使用最多30天，在30天内必须刷新token，否则将失效
            try {
              const response = await http.post(user.server + '/user/flashToken')
              // 刷新成功，直接进入
              user.flashToken(response.data.token)
            } catch (res: any) {
              // 刷新token失败，任何问题都有可能，但是允许用户继续使用
              if (res.status == 200 && res.data.code != 200) {
                console.error(res.data.msg)
              }
              // 切换到离线模式
              store.update_online(false)
            }
          }
        }
      } else {
        // 代表已经超过60天，并且在后30天没有刷新过token，需要重新登录
        message.warning('token expired', 3)
        await logout()
        return
      }
    } catch (err) {
      await logout()
      return
    }
  } catch (err: any) {
    message.warning(err, 3)
    logout()
    return
  }
  sync.sync()
  // 监听内容变动
  listen.listenFileSave()
  // 监听偏好设置即时生效
  preference.getLocal()
}

const logout = async () => {
  user.unSetActiver()
  try {
    return await router.push('/login')
  } catch (err) {
    console.log(err)
  }
}
emitter.on('query-close-note', showCloseQuery)
// 调用主函数
init()

onUnmounted(() => {
  emitter.off('query-close-note', showCloseQuery)
})
</script>
<style lang="stylus" scoped>
.default-view
  flex 1
  width 100%
  height 100%
  justify-content center
  align-items center

.container
  height 100vh

.editor
  flex 1
  min-width 0
  max-width 100%
  padding-top var(--titleBarHeight)

.editor, .editor-title
  background-color var(--editorBgColor)

.editor-title
  width 100%
  padding 5px 10px
  font-size 24px
  font-weight 500

  &:focus
    outline none

.editor-wrapper
  height 100%
  min-width 150px
  overflow auto

.tags
  bottom 0px
  width 100%
  height auto
  min-height 20px
  background-color #aaeedd

  ul
    list-style-type none
    display inline

    li
      border 1px
      border-radius 5px
      background-color aqua
      padding-left 10px
      color black
      float left
</style>
