<template>
  <div class="flex h-screen flex-col">
    <TitleBar v-show="!nativeBar" />
    <ResizablePanelGroup
      id="editor-layout"
      direction="horizontal"
      class="flex flex-1 flex-row overflow-auto border-t border-border/50"
    >
      <ResizablePanel
        v-show="preference.toggleSidebar"
        id="sidebar"
        :default-size="18"
        :min-size="12"
        :max-size="25"
      >
        <Sidebar class="h-full" />
      </ResizablePanel>
      <ResizableHandle id="handle-1" class="bg-border/50" />
      <ResizablePanel id="editor" :default-size="82">
        <div class="size-full">
          <!-- Welcome Screen -->
          <div
            class="flex h-full flex-col items-center justify-center overflow-hidden px-6 py-6"
            v-show="!editorS.isEdit"
          >
            <!-- Hero Section -->
            <div class="mx-auto max-w-2xl text-center mb-6 animate-fade-in shrink-0">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-sm mb-4">
                <span class="icon-[lucide--sparkles] text-xs" />
                <span>让写作回归纯粹</span>
              </div>
              <h1 class="heading-serif text-3xl mb-2 tracking-tight">
                欢迎回到 <span class="gradient-text">Markman</span>
              </h1>
              <p class="text-base text-muted-foreground max-w-md mx-auto">
                您的私人 Markdown 写作空间
              </p>
            </div>

            <!-- Feature Cards Grid -->
            <div class="mx-auto grid w-full max-w-3xl gap-3 grid-cols-3 stagger-children min-h-0 shrink">
              <!-- Quick Start -->
              <div
                class="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--book-open] text-base text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 class="text-sm font-semibold mb-1.5">开始使用</h3>
                  <ul class="space-y-1 text-xs text-muted-foreground">
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--plus-circle] mt-0.5 text-[10px] text-primary shrink-0" />
                      <span>点击 <strong class="text-foreground">+</strong> 创建笔记</span>
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--folder-plus] mt-0.5 text-[10px] text-primary shrink-0" />
                      <span>右键管理笔记本</span>
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--move] mt-0.5 text-[10px] text-primary shrink-0" />
                      <span>拖放整理层级</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Keyboard Shortcuts -->
              <div
                class="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--keyboard] text-base text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 class="text-sm font-semibold mb-1.5">快捷键</h3>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">保存</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/50">Ctrl+S</kbd>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">侧边栏</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/50">Ctrl+B</kbd>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">搜索</span>
                      <kbd class="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/50">Ctrl+K</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Data & Privacy -->
              <div
                class="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--shield-check] text-base text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 class="text-sm font-semibold mb-1.5">数据安全</h3>
                  <ul class="space-y-1 text-xs text-muted-foreground">
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--check] mt-0.5 text-[10px] text-indigo-500 shrink-0" />
                      <span>本地存储，自动保存</span>
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--check] mt-0.5 text-[10px] text-indigo-500 shrink-0" />
                      <span>支持云端同步</span>
                    </li>
                    <li class="flex items-start gap-1.5">
                      <span class="icon-[lucide--check] mt-0.5 text-[10px] text-indigo-500 shrink-0" />
                      <span>开源免费 GPL-3.0</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 text-center text-xs text-muted-foreground/60 animate-fade-in shrink-0" style="animation-delay: 0.6s">
              <p class="flex items-center justify-center gap-1.5">
                <span>Crafted with</span>
                <span class="icon-[lucide--heart] text-rose-500 text-[10px]" />
                <span>using</span>
                <span class="text-amber-600 dark:text-amber-400">Vue3</span>
                <span>+</span>
                <span class="text-teal-600 dark:text-teal-400">Electron</span>
                <span>+</span>
                <span class="text-orange-600 dark:text-orange-400">Go</span>
              </p>
            </div>
          </div>

          <!-- Editor -->
          <div class="flex size-full flex-1 flex-col" v-show="editorS.isEdit">
            <AsyncEditorPane />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import TitleBar from '@/components/titleBar.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { emitter } from '@/lib/emitter.ts'
import { Modal, message } from 'ant-design-vue'

import { useListenStore, useEditorStore, usePreferenceStore } from '@/store'
const editorS = useEditorStore()
const AsyncEditorPane = defineAsyncComponent(
  () => import('@/components/milkdown/EditorPane.vue'),
)

// 处理笔记切换
const showCloseQuery = async (id: any) => {
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
        resolve(await editorS.loadNote(id))
      },
    })
  })
}

const preference = usePreferenceStore()

// 监听笔记关闭事件

const nativeBar = computed(() => preference.nativeBar)

onMounted(() => {
  // 监听内容变动
  const listen = useListenStore()
  listen.listenFileSave()
  emitter.on('query-close-note', showCloseQuery)
})

onUnmounted(() => {
  emitter.off('query-close-note', showCloseQuery)
})
</script>

<style scoped>
.editor-title {
  width: 100%;
  padding: 5px 10px;
  font-size: 24px;
  font-weight: 500;
}

.editor-title:focus {
  outline: none;
}

.tags {
  width: 100%;
  height: auto;
  min-height: 26px;
  background-color: #aaeedd;
}
</style>
