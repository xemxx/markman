<template>
  <div
    class="flex h-full flex-col border-r border-border bg-background text-foreground"
  >
    <!-- 顶部用户菜单 -->
    <div
      class="flex h-12 items-center justify-between border-b border-border bg-gradient-to-r from-emerald-50 to-slate-50 px-4 shadow-sm dark:from-background dark:to-background"
    >
      <Menu />
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 rounded-full hover:bg-emerald-100 dark:hover:bg-primary/10"
        @click="toggleSearchInput()"
      >
        <span
          class="icon-[lucide--search] size-4 text-emerald-600 dark:text-primary"
        />
      </Button>
    </div>

    <!-- 搜索框 -->
    <div
      v-show="isSearchVisible"
      class="relative w-full overflow-hidden p-2 transition-all duration-200 ease-in-out"
    >
      <Input
        v-model="searchStr"
        placeholder="搜索笔记"
        @keyup.enter="doSearch"
        class="pl-8 focus-visible:ring-1 focus-visible:ring-emerald-500 dark:focus-visible:ring-accent"
        @keyup.esc="toggleSearchInput(false)"
        ref="searchInputRef"
      />
      <span class="absolute inset-y-0 left-0 flex items-center pl-3.5">
        <span
          class="icon-[lucide--search] size-4 text-emerald-500 dark:text-muted-foreground"
        />
      </span>
    </div>

    <!-- 笔记管理区域 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <div
        class="flex items-center justify-between border-y border-emerald-100 bg-gradient-to-r from-emerald-50 to-slate-50 px-4 py-2 dark:border-border dark:from-muted/30 dark:to-muted/30"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
        :class="{
          'border-2 border-dashed border-emerald-500 bg-muted/80 dark:border-primary':
            isDragOver,
        }"
      >
        <h2
          class="text-base font-semibold tracking-tight text-emerald-700 dark:text-foreground"
        >
          笔记管理
        </h2>
        <div class="flex gap-2">
          <div class="relative" ref="menuRef">
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 rounded-full hover:bg-emerald-100 dark:hover:bg-primary/10"
              @click="toggleMenu"
            >
              <span
                class="icon-[lucide--plus] size-4 text-emerald-600 dark:text-primary"
              />
            </Button>
            <div
              v-if="menuOpen"
              class="absolute right-0 z-10 mt-2 min-w-[8rem] rounded-md border bg-popover shadow-md animate-in fade-in-50 zoom-in-95"
              @mousedown.stop
            >
              <div
                class="flex cursor-pointer items-center px-3 py-2 hover:bg-emerald-50 dark:hover:bg-accent"
                @click="onMenuItemClick('note')"
              >
                <span
                  class="icon-[lucide--file-plus] mr-2 size-4 text-blue-500 dark:text-blue-400"
                />
                新建笔记
              </div>
              <div
                class="flex cursor-pointer items-center px-3 py-2 hover:bg-emerald-50 dark:hover:bg-accent"
                @click="onMenuItemClick('folder')"
              >
                <span
                  class="icon-[lucide--folder-plus] mr-2 size-4 text-amber-600 dark:text-amber-400"
                />
                新建笔记本
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建输入框 - 移到 ScrollArea 外部 -->
      <div v-if="createInputShow" class="mb-1 px-2 py-1">
        <input
          ref="createInputRef"
          v-model="createName"
          :placeholder="
            createType === 'note' ? '输入笔记名称' : '输入笔记本名称'
          "
          class="w-full flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:focus-visible:ring-accent"
          @keyup.enter="doCreateItem"
          @keyup.esc="hideCreateInput"
          @keydown.stop
          @click.stop
          @blur="onInputBlur"
        />
      </div>

      <!-- 笔记本树 -->
      <ScrollArea ref="scrollAreaRef" class="flex-1 px-1 pt-1">
        <TreeRoot
          class="w-full select-none rounded-lg bg-background p-0.5 text-sm"
          :items="trees"
          :get-key="item => item.key"
          :typeahead-search="false"
        >
          <Tree :tree-items="trees" />
        </TreeRoot>
      </ScrollArea>
    </div>

    <!-- 底部工具栏 -->
    <Footer
      class="border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-slate-50 py-2 dark:border-border dark:from-muted/30 dark:to-muted/30"
    />
  </div>
</template>

<script setup lang="ts">
import { useSidebarStore, useSyncStore, usePreferenceStore } from '@/store'
import Menu from './menu.vue'
import Footer from './footer.vue'
import { TreeRoot } from 'reka-ui'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue'

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

  // 移除点击外部区域的事件监听器
  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }
})

// 统一的创建输入框
const createInputShow = ref(false)
const createName = ref('')
const createType = ref<'note' | 'folder'>('note')
const createInputRef = ref<HTMLInputElement | null>(null)

// 显示创建输入框
const showCreateInput = (type: 'note' | 'folder') => {
  // 移除之前的点击外部区域事件监听器
  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }

  // 关键：延迟显示输入框，确保 DropdownMenu 关闭后再显示
  setTimeout(() => {
    createType.value = type
    createName.value = ''
    createInputShow.value = true

    nextTick(() => {
      if (createInputRef.value) {
        createInputRef.value.focus()
      }
      // 用 setTimeout 延迟注册监听器，避免本次点击被捕获
      setTimeout(() => {
        clickOutsideHandler = (event: MouseEvent) => {
          const inputElement = createInputRef.value
          if (inputElement && !inputElement.contains(event.target as Node)) {
            hideCreateInput()
          }
        }
        document.addEventListener('mousedown', clickOutsideHandler)
      }, 0)
    })
  }, 0)
}

// 隐藏创建输入框
const hideCreateInput = () => {
  createInputShow.value = false
  createName.value = ''

  // 移除点击外部区域的事件监听器
  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }
}

// 点击外部区域关闭输入框
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null

// 创建项目
const doCreateItem = async () => {
  const name = createName.value.trim()
  if (!name) {
    hideCreateInput()
    return
  }
  await sidebar.addNodeInTree('root', createType.value, name)

  // 先隐藏输入框
  hideCreateInput()

  // 延迟刷新树结构，避免干扰输入框的隐藏
  setTimeout(async () => {
    await sidebar.loadNodeTree()
  }, 100)
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
  if (sidebar.currentDragNode.parentId == 'root') return

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
      await sidebar.moveNode({
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

  // 尝试直接在 DOM 中查找滚动视口元素
  try {
    // 查找 reka-scroll-area-viewport 数据属性
    const viewport = document.querySelector('[data-reka-scroll-area-viewport]')
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

const onInputBlur = e => {
  console.log('输入框失焦', e, new Error().stack)
}

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
const onMenuItemClick = (type: 'note' | 'folder') => {
  menuOpen.value = false
  showCreateInput(type)
}
const handleClickOutside = (e: MouseEvent) => {
  if (
    menuOpen.value &&
    menuRef.value &&
    !menuRef.value.contains(e.target as Node)
  ) {
    menuOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// 搜索输入框的显示控制
const isSearchVisible = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const toggleSearchInput = (show?: boolean) => {
  console.log(
    'toggleSearchInput 被调用, 当前状态:',
    isSearchVisible.value,
    '参数:',
    show,
  )

  if (show !== undefined) {
    isSearchVisible.value = show
  } else {
    isSearchVisible.value = !isSearchVisible.value
  }

  console.log('切换后的状态:', isSearchVisible.value)

  // 如果显示搜索框，则聚焦输入框
  if (isSearchVisible.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}
</script>

<style scoped>
:deep(.scrollbar) {
  @apply w-1.5 rounded-full bg-slate-100 dark:bg-muted;
}

:deep(.scrollbar-thumb) {
  @apply rounded-full bg-emerald-200 transition-colors hover:bg-emerald-300 dark:bg-muted-foreground/20 dark:hover:bg-muted-foreground/40;
}
</style>
