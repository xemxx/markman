<template>
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
          :value="editorS.currentNote.markdown"
          @change="handleChange"
          placeholder="请输入内容"
        />
      </a-flex>
      <div class="tags">tags</div>
    </a-flex>
  </a-flex>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import MarkDown from '@/components/MarkDown/Markdown.vue'
import { usePreferenceStore } from '@/store/preference'
import { useListenStore } from '@/store/listen'
import { useSyncStore } from '@/store/sync'
import { useEditorStore } from '@/store/editor'
import { computed, onUnmounted } from 'vue'
import { emitter } from '@/emitter'
import { Modal } from 'ant-design-vue'

const preference = usePreferenceStore()
const listen = useListenStore()
const sync = useSyncStore()

// 监听内容变动
listen.listenFileSave()
// 监听偏好设置即时生效
preference.getLocal()

const editorS = useEditorStore()

const title = computed({
  get: function () {
    return editorS.currentNote.title
  },
  set: function (newVal) {
    editorS.listenContentChange({
      title: newVal,
      markdown: undefined,
    })
  },
})
const handleChange = (value: string) => {
  editorS.listenContentChange({
    title: undefined,
    markdown: value,
  })
}
const showCloseQuery = (id: any) => {
  Modal.confirm({
    content: '当前笔记改动是否保存？',
    title: '提示',
    okText: '是',
    cancelText: '否',
    onOk: async () => {
      await editorS.saveNote(editorS.currentNote)
      return await editorS.loadNote(id)
    },
    onCancel: () => {
      editorS.currentNote.isSave = true
      return editorS.loadNote(id)
    },
  })
}

emitter.on('query-close-note', showCloseQuery)

sync.sync()

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
