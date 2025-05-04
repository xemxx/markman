<template>
  <div class="flex h-screen flex-col">
    <TitleBar v-show="!nativeBar" />
    <ResizablePanelGroup
      id="editor-layout"
      direction="horizontal"
      class="flex flex-1 flex-row overflow-auto border-t"
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
      <ResizableHandle id="handle-1" />
      <ResizablePanel id="editor" :default-size="82">
        <div class="size-full">
          <div
            class="flex h-full flex-col items-center justify-center overflow-auto px-6 py-8"
            v-show="!editorS.isEdit"
          >
            <div class="mx-auto max-w-3xl text-center">
              <h1
                class="mb-4 text-3xl font-bold text-emerald-600 dark:text-emerald-400"
              >
                欢迎使用 Markman
              </h1>
              <p class="mb-8 text-muted-foreground">
                功能强大的本地 Markdown 笔记应用
              </p>
            </div>

            <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <!-- 开始使用 -->
              <div
                class="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <h2 class="mb-4 flex items-center text-xl font-semibold">
                  <span
                    class="icon-[lucide--book-open] mr-2 size-5 text-emerald-500"
                  ></span>
                  开始使用
                </h2>
                <ul class="space-y-3 text-sm text-muted-foreground">
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-emerald-500"
                    ></span>
                    <span
                      >点击左侧<strong class="text-foreground">笔记管理</strong
                      >区域的<strong class="text-foreground">+</strong
                      >按钮创建新笔记</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-emerald-500"
                    ></span>
                    <span
                      >使用<strong class="text-foreground">右键菜单</strong
                      >对笔记和笔记本进行管理</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-emerald-500"
                    ></span>
                    <span
                      >通过<strong class="text-foreground">拖放</strong
                      >整理笔记的层级关系</span
                    >
                  </li>
                </ul>
              </div>

              <!-- Markdown 功能 -->
              <div
                class="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <h2 class="mb-4 flex items-center text-xl font-semibold">
                  <span
                    class="icon-[lucide--edit-3] mr-2 size-5 text-blue-500"
                  ></span>
                  Markdown 功能
                </h2>
                <ul class="space-y-3 text-sm text-muted-foreground">
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-blue-500"
                    ></span>
                    <span
                      >支持所有标准
                      <strong class="text-foreground"
                        >Markdown 语法</strong
                      ></span
                    >
                  </li>
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-blue-500"
                    ></span>
                    <span
                      >实时预览和<strong class="text-foreground"
                        >所见即所得</strong
                      >编辑体验</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--check-circle] mr-2 mt-0.5 size-4 text-blue-500"
                    ></span>
                    <span
                      >支持<strong class="text-foreground">代码高亮</strong
                      >和<strong class="text-foreground">数学公式</strong></span
                    >
                  </li>
                </ul>
              </div>

              <!-- 快捷键 -->
              <div
                class="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <h2 class="mb-4 flex items-center text-xl font-semibold">
                  <span
                    class="icon-[lucide--keyboard] mr-2 size-5 text-amber-500"
                  ></span>
                  常用快捷键
                </h2>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">保存笔记</span>
                    <kbd
                      class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs"
                      >Ctrl + S</kbd
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">切换侧边栏</span>
                    <kbd
                      class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs"
                      >Ctrl + B</kbd
                    >
                  </div>
                </div>
              </div>

              <!-- 提示 -->
              <div
                class="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <h2 class="mb-4 flex items-center text-xl font-semibold">
                  <span
                    class="icon-[lucide--lightbulb] mr-2 size-5 text-yellow-500"
                  ></span>
                  使用提示
                </h2>
                <ul class="space-y-3 text-sm text-muted-foreground">
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--info] mr-2 mt-0.5 size-4 text-yellow-500"
                    ></span>
                    <span
                      >编辑时自动<strong class="text-foreground"
                        >保存草稿</strong
                      >，防止意外丢失</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span
                      class="icon-[lucide--info] mr-2 mt-0.5 size-4 text-yellow-500"
                    ></span>
                    <span
                      >在设置中<strong class="text-foreground"
                        >自定义主题</strong
                      >和编辑器偏好</span
                    >
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-8 text-center text-sm text-muted-foreground">
              <p>Markman - 开源且高效的 Markdown 笔记应用</p>
              <p class="mt-1">
                使用 <span class="text-emerald-500">Vue3</span> +
                <span class="text-blue-500">Electron</span> +
                <span class="text-amber-500">Go</span> 构建
              </p>
            </div>
          </div>
          <div class="flex size-full flex-1 flex-col" v-show="editorS.isEdit">
            <MilkdownProvider>
              <Milkdown />
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
