<template>
  <div class="flex h-screen flex-col">
    <TitleBar v-show="!nativeBar" />
    <ResizablePanelGroup
      id="editor-layout"
      direction="horizontal"
      class="flex flex-1 flex-row overflow-auto border-t"
    >
      <ResizablePanel
        id="sidebar"
        :default-size="18"
        :min-size="12"
        :max-size="25"
      >
        <Sidebar class="h-full" />
      </ResizablePanel>
      <ResizableHandle id="handle-1" />
      <ResizablePanel id="editor" :default-size="82">
        <div class="size-full">
          <div
            class="flex flex-1 content-center justify-center"
            v-show="!editorS.isEdit"
          >
            <h1>Welcome</h1>
          </div>
          <div class="flex size-full flex-1 flex-col" v-show="editorS.isEdit">
            <MilkdownProvider>
              <CrepeEditor />
            </MilkdownProvider>
            <!-- <div class="tags">tags</div> -->
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import CrepeEditor from '@/components/milkdown/CrepeEditor.vue'
import { MilkdownProvider } from '@milkdown/vue'
import TitleBar from '@/components/titleBar.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { computed, onMounted, onUnmounted } from 'vue'
import { emitter } from '@/lib/emitter.ts'
import { Modal, message } from 'ant-design-vue'

import { useListenStore, useEditorStore, usePreferenceStore } from '@/store'

const editorS = useEditorStore()

// 检查笔记是否有未保存的修改
const hasUnsavedChanges = () => {
  return editorS.modify && !editorS.currentNote.isSave
}

// 处理笔记切换
const showCloseQuery = async (id: any) => {
  if (!hasUnsavedChanges()) {
    // 如果没有未保存的修改，直接切换
    return await editorS.loadNote(id)
  }

  // 有未保存的修改，显示确认对话框
  return new Promise(resolve => {
    Modal.confirm({
      content: '当前笔记有未保存的改动，是否保存？',
      title: '保存提示',
      okText: '保存',
      cancelText: '不保存',
      onOk: async () => {
        try {
          await editorS.saveNote()
          resolve(await editorS.loadNote(id))
        } catch (error) {
          console.error('保存笔记失败:', error)
          message.error('保存笔记失败，请重试')
        }
      },
      onCancel: async () => {
        // 放弃修改，重置状态
        editorS.setNoteModified(false)
        resolve(await editorS.loadNote(id))
      },
    })
  })
}

const preference = usePreferenceStore()

// 监听笔记关闭事件
emitter.on('query-close-note', showCloseQuery)

const nativeBar = computed(() => preference.nativeBar)

onMounted(() => {
  // 监听内容变动
  const listen = useListenStore()
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
