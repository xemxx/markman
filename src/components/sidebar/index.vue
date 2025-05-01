<template>
  <div
    v-show="toggleSidebar"
    class="flex flex-col h-full bg-background text-foreground"
  >
    <!-- 顶部用户菜单 -->
    <div class="flex items-center justify-between h-12 px-4 border-b">
      <Menu />
    </div>

    <!-- 搜索框 -->
    <div class="relative w-full p-2">
      <Input
        v-model="searchStr"
        placeholder="搜索笔记"
        @keyup.enter="doSearch"
        class="pl-10"
      />
      <span
        class="absolute inset-y-0 flex items-center justify-center px-2 start-0"
      >
        <span class="icon-[lucide--search] size-5 text-muted-foreground" />
      </span>
    </div>

    <!-- 笔记管理区域 -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <div
        class="flex items-center justify-between px-4 py-2"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
        :class="{
          'border-2 border-dashed border-ring bg-muted/80': isDragOver,
        }"
      >
        <h2 class="text-lg font-semibold">笔记管理</h2>
        <div class="flex gap-2">
          <div class="relative group">
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8"
              @click="showAddBook"
            >
              <span class="icon-[lucide--folder-plus] size-5" />
            </Button>
            <div
              class="absolute right-0 hidden px-2 py-1 mt-1 text-sm rounded shadow-md top-full bg-popover text-popover-foreground group-hover:block"
            >
              新建笔记本
            </div>
          </div>
          <div class="relative group">
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8"
              @click="showAddNote"
            >
              <span class="icon-[lucide--file-plus] size-5" />
            </Button>
            <div
              class="absolute right-0 hidden px-2 py-1 mt-1 text-sm rounded shadow-md top-full bg-popover text-popover-foreground group-hover:block"
            >
              新建笔记
            </div>
          </div>
        </div>
      </div>

      <!-- 笔记本树 -->
      <ScrollArea ref="scrollAreaRef" class="flex-1 px-2">
        <div v-show="bookInputShow" class="mb-2">
          <Input
            ref="bookInputRef"
            v-model="bookName"
            placeholder="输入笔记本名称"
            class="w-full"
            @keyup.enter="doAddBook"
            @blur="blurAddBook"
          />
        </div>
        <TreeRoot
          class="w-full p-1 text-sm rounded-lg select-none bg-background"
          :items="trees"
          :get-key="item => item.key"
        >
          <Tree :tree-items="trees" />
        </TreeRoot>
      </ScrollArea>
    </div>

    <!-- 底部工具栏 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useSidebarStore, useSyncStore, usePreferenceStore } from '@/store'
import { storeToRefs } from 'pinia'
import Menu from './menu.vue'
import Footer from './footer.vue'
import { TreeRoot } from 'radix-vue'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  ref,
  nextTick,
  useTemplateRef,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

const preference = usePreferenceStore()
const { toggleSidebar } = storeToRefs(preference)

const sidebar = useSidebarStore()
const trees = computed(() => {
  if (sidebar.inSearch) {
    return sidebar.searchResult
  }
  return sidebar.treeLabels
})

onMounted(async () => {
  const sync = useSyncStore()
  await sync.sync()
  document.addEventListener('dragover', handleDragScroll, { passive: true })
  document.addEventListener('dragend', clearScrollInterval)
  document.addEventListener('drop', clearScrollInterval)

  // 在下一个 tick 缓存滚动元素，避免频繁查找
  nextTick(() => {
    cachedScrollElement = findScrollableElement()
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('dragover', handleDragScroll)
  document.removeEventListener('dragend', clearScrollInterval)
  document.removeEventListener('drop', clearScrollInterval)
  clearScrollInterval()
  cachedScrollElement = null
})

// 添加笔记本
const bookInputShow = ref(false)
const bookName = ref('')

const showAddBook = () => {
  bookInputShow.value = true
}

const blurAddBook = () => {
  bookInputShow.value = false
  bookName.value = ''
}

const doAddBook = async () => {
  const name = bookName.value.trim()
  if (!name) {
    blurAddBook()
    return
  }
  await sidebar.addFolder(name)
  await sidebar.loadNodeTree()
  blurAddBook()
}

// 搜索功能
const searchStr = ref('')
const doSearch = () => {
  sidebar.searchTreeNodes(searchStr.value)
}

watch(searchStr, newVal => {
  if (!newVal) {
    sidebar.exitSearch()
  }
})

// 添加笔记
const showAddNote = async () => {
  await sidebar.addRootNote()
}

// 拖拽相关
const isDragOver = ref(false)

const onDragEnter = (event: DragEvent) => {
  if (!event.dataTransfer) return

  // 检查是否有拖拽中的节点
  if (!sidebar.currentDragNode) return

  if (sidebar.currentDragNode.parentId === 'root') return

  // 根区域总是允许拖放
  event.preventDefault()
  isDragOver.value = true
}

const onDragOver = (event: DragEvent) => {
  if (!event.dataTransfer) return

  // 检查是否有拖拽中的节点
  if (!sidebar.currentDragNode) return

  if (sidebar.currentDragNode.parentId === 'root') return

  // 根区域总是允许拖放
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (!event.dataTransfer) return
  if (!sidebar.currentDragNode) return

  try {
    // 使用全局状态中的拖拽节点数据
    const dragData = sidebar.currentDragNode

    // 找到拖拽的节点
    const findNodeByKey = (nodes: TreeNode[], key: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node

        if (node.children) {
          const found = findNodeByKey(node.children, key)
          if (found) return found
        }
      }

      return null
    }

    const draggedNode = findNodeByKey(sidebar.treeLabels, dragData.key)
    if (!draggedNode) return

    // 执行移动操作
    if (draggedNode.type === 'file') {
      // 移动文件到根目录
      await sidebar.moveNote({
        id: draggedNode.data.id,
        parentId: 'root',
      })
    } else if (draggedNode.type === 'folder') {
      // 移动文件夹到根目录
      await sidebar.moveFolder(draggedNode.key, 'root')
    }

    // 清除拖拽状态
    sidebar.clearDragNode()

    // 刷新树
    await sidebar.loadNodeTree()
  } catch (error) {
    console.error('拖拽处理错误:', error)
    sidebar.clearDragNode()
  }
}

// 拖拽时自动滚动功能
const scrollAreaRef = ref<any>(null)
let scrollInterval: number | null = null
let cachedScrollElement: HTMLElement | null = null

// 清除滚动定时器
const clearScrollInterval = () => {
  if (scrollInterval !== null) {
    window.clearInterval(scrollInterval)
    scrollInterval = null
  }
}

// 处理拖拽时的滚动
const handleDragScroll = (event: DragEvent) => {
  // 使用缓存的滚动元素或重新查找
  const scrollElement = cachedScrollElement || findScrollableElement()
  if (!scrollElement) return

  // 获取真实的滚动区域位置
  const rect = scrollElement.getBoundingClientRect()

  // 设置敏感区域高度
  const sensitiveAreaHeight = 80

  // 计算鼠标与容器上下边缘的距离
  const topDistance = event.clientY - rect.top
  const bottomDistance = rect.bottom - event.clientY

  // 清除之前的滚动定时器
  clearScrollInterval()

  try {
    // 鼠标靠近顶部，向上滚动
    if (topDistance >= 0 && topDistance < sensitiveAreaHeight) {
      // 计算滚动速度
      const speed =
        Math.max(1, Math.floor((sensitiveAreaHeight - topDistance) / 10)) * 3

      scrollInterval = window.setInterval(() => {
        // 安全检查
        if (scrollElement && typeof scrollElement.scrollTop === 'number') {
          scrollElement.scrollTop -= speed
        } else {
          clearScrollInterval()
        }
      }, 16)
    }
    // 鼠标靠近底部，向下滚动
    else if (bottomDistance >= 0 && bottomDistance < sensitiveAreaHeight) {
      // 计算滚动速度
      const speed =
        Math.max(1, Math.floor((sensitiveAreaHeight - bottomDistance) / 10)) * 3

      scrollInterval = window.setInterval(() => {
        // 安全检查
        if (scrollElement && typeof scrollElement.scrollTop === 'number') {
          scrollElement.scrollTop += speed
        } else {
          clearScrollInterval()
        }
      }, 16)
    }
  } catch (err) {
    console.error('滚动操作出错:', err)
    clearScrollInterval()
  }
}

// 查找可滚动元素
const findScrollableElement = (): HTMLElement | null => {
  if (!scrollAreaRef.value) return null

  // 尝试获取组件的 $el 属性（Vue 组件实例）
  const element = scrollAreaRef.value.$el || scrollAreaRef.value

  // 尝试直接在 DOM 中查找滚动视口元素
  try {
    // 查找 radix-scroll-area-viewport 数据属性
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport && viewport instanceof HTMLElement) {
      return viewport
    }

    // 查找 ScrollArea 的滚动容器
    const scrollContainer = document.querySelector('.scrollbar')?.parentElement
    if (scrollContainer && scrollContainer instanceof HTMLElement) {
      return scrollContainer
    }

    // 如果仍然找不到，查找任何具有滚动条的元素
    const scrollableElements = document.querySelectorAll('.flex-1.px-2 *')
    for (const el of scrollableElements) {
      if (el instanceof HTMLElement) {
        const hasVerticalScrollbar = el.scrollHeight > el.clientHeight
        const style = window.getComputedStyle(el)
        const overflowY = style.getPropertyValue('overflow-y')

        if (hasVerticalScrollbar && ['auto', 'scroll'].includes(overflowY)) {
          return el
        }
      }
    }
  } catch (err) {
    console.error('查找滚动元素时出错:', err)
  }

  return null
}
</script>

<style scoped>
:deep(.scrollbar) {
  @apply w-2 rounded-md bg-muted;
}

:deep(.scrollbar-thumb) {
  @apply rounded-md bg-muted-foreground/20 hover:bg-muted-foreground/30;
}
</style>
