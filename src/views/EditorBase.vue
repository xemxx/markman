<template>
  <div class="flex h-screen flex-col noise-bg">
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
            class="flex h-full flex-col items-center justify-center overflow-auto px-8 py-12"
            v-show="!editorS.isEdit"
          >
            <!-- Hero Section -->
            <div class="mx-auto max-w-2xl text-center mb-12 animate-fade-in">
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm mb-6">
                <span class="icon-[lucide--sparkles] text-xs" />
                <span>让写作回归纯粹</span>
              </div>
              <h1 class="heading-serif text-4xl md:text-5xl mb-4 tracking-tight">
                欢迎回到 <span class="gradient-text">Markman</span>
              </h1>
              <p class="text-lg text-muted-foreground max-w-md mx-auto">
                您的私人 Markdown 写作空间
              </p>
            </div>

            <!-- Feature Cards Grid -->
            <div class="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              <!-- Quick Start -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--book-open] text-xl text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">开始使用</h3>
                  <ul class="space-y-2 text-sm text-muted-foreground">
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--plus-circle] mt-0.5 text-xs text-primary" />
                      <span>点击左侧 <strong class="text-foreground">+</strong> 创建笔记</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--folder-plus] mt-0.5 text-xs text-primary" />
                      <span>右键管理笔记本</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--move] mt-0.5 text-xs text-primary" />
                      <span>拖放整理层级</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Markdown Features -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--file-code] text-xl text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">Markdown 支持</h3>
                  <ul class="space-y-2 text-sm text-muted-foreground">
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--check] mt-0.5 text-xs text-teal-500" />
                      <span>标准 <strong class="text-foreground">Markdown</strong> 语法</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--check] mt-0.5 text-xs text-teal-500" />
                      <span><strong class="text-foreground">WYSIWYG</strong> 所见即所得</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="icon-[lucide--check] mt-0.5 text-xs text-teal-500" />
                      <span>代码高亮 & 数学公式</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Keyboard Shortcuts -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--keyboard] text-xl text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">快捷键</h3>
                  <div class="space-y-3 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">保存笔记</span>
                      <kbd class="px-2 py-1 rounded-lg bg-muted text-xs font-mono border border-border/50">Ctrl + S</kbd>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">切换侧边栏</span>
                      <kbd class="px-2 py-1 rounded-lg bg-muted text-xs font-mono border border-border/50">Ctrl + B</kbd>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">快速搜索</span>
                      <kbd class="px-2 py-1 rounded-lg bg-muted text-xs font-mono border border-border/50">Ctrl + K</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Privacy -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--shield-check] text-xl text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">数据安全</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    数据本地存储，<strong class="text-foreground">自动保存</strong>草稿，支持<strong class="text-foreground">云端同步</strong>，让您的笔记永不丢失。
                  </p>
                </div>
              </div>

              <!-- Customization -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--palette] text-xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">个性化</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    支持<strong class="text-foreground">深色/浅色</strong>主题切换，自定义编辑器偏好，打造专属写作环境。
                  </p>
                </div>
              </div>

              <!-- Open Source -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover-lift transition-all duration-500"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div class="relative">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span class="icon-[lucide--github] text-xl text-slate-700 dark:text-slate-300" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">开源免费</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    Markman 是 <strong class="text-foreground">开源软件</strong>，基于 GPL-3.0 协议，欢迎参与贡献。
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-12 text-center text-sm text-muted-foreground/60 animate-fade-in" style="animation-delay: 0.6s">
              <p class="flex items-center justify-center gap-2">
                <span>Crafted with</span>
                <span class="icon-[lucide--heart] text-rose-500 text-xs" />
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
            <MilkdownProvider>
              <Milkdown />
            </MilkdownProvider>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import Milkdown from '@/components/milkdown/CrepeEditor.vue'
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
