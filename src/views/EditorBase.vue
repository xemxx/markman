<template>
  <div class="flex h-screen flex-col">
    <TitleBar v-show="!nativeBar" />
    <ResizablePanelGroup
      id="sidebar"
      direction="horizontal"
      class="flex flex-1 flex-row overflow-auto border-t"
    >
      <ResizablePanel
        id="demo-panel-1"
        :default-size="18"
        :min-size="12"
        :max-size="25"
      >
        <Sidebar class="h-full" />
      </ResizablePanel>
      <ResizableHandle id="handle-1" />
      <ResizablePanel id="editor" :default-size="85">
        <div class="flex h-full flex-1">
          <div
            class="flex h-full w-full content-center justify-center"
            v-show="!editorS.isEdit"
          >
            <h1>Welcome</h1>
          </div>
          <div class="flex h-full w-full flex-col" v-show="editorS.isEdit">
            <input v-model="title" class="editor-title h-10 border-b" />
            <MarkDown
              :value="editorS.currentNote.content"
              @change="handleChange"
              placeholder="请输入内容"
              class="flex-1 overflow-auto"
            />
            <div class="tags">tags</div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import MarkDown from '@/components/MarkDown/Markdown.vue'
import TitleBar from '@/components/titleBar.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { usePreferenceStore } from '@/store'
import { useListenStore } from '@/store'
import { useEditorStore } from '@/store'
import { computed, onMounted, onUnmounted } from 'vue'
import { emitter } from '@/emitter'
import { Modal } from 'ant-design-vue'

import http from '@/plugins/axios'

import { message } from 'ant-design-vue'
import { useSysStore } from '@/store'
import { useUserStore } from '@/store'
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

const nativeBar = computed(() => preference.nativeBar)

onMounted(() => {
  // 监听内容变动
  listen.listenFileSave()
})

onUnmounted(() => {
  emitter.off('query-close-note', showCloseQuery)
})
</script>
<style lang="stylus" scoped>



.editor-title
  width 100%
  padding 5px 10px
  font-size 24px
  font-weight 500

  &:focus
    outline none


.tags
  width 100%
  height auto
  min-height 26px
  background-color #aaeedd
</style>
