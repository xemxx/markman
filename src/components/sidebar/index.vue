<template>
  <div
    class="relative flex h-full flex-col border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/20 text-foreground"
  >
    <!-- 顶部用户菜单 -->
    <div
      class="flex h-14 items-center justify-between border-b border-border/50 px-4 bg-background/80 backdrop-blur-sm"
    >
      <Menu />
    </div>

    <!-- 排序菜单浮层 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="sortMenuOpen"
        class="absolute right-4 top-20 z-20 min-w-[14rem] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md shadow-xl"
        @mousedown.stop
      >
        <div class="p-3">
          <div class="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            排序方式
          </div>
          <div class="space-y-1">
            <button
              class="w-full flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              :class="{
                'bg-primary/10 text-primary': sidebar.sortConfig.mode === 'name',
                'hover:bg-muted text-foreground': sidebar.sortConfig.mode !== 'name',
              }"
              @click="setSortMode('name')"
            >
              <span
                class="icon-[lucide--arrow-up-a-z] mr-3 size-4"
                :class="sidebar.sortConfig.mode === 'name' ? 'text-primary' : 'text-muted-foreground'"
              />
              按名称排序
            </button>
            <button
              class="w-full flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
              :class="{
                'bg-primary/10 text-primary': sidebar.sortConfig.mode === 'date',
                'hover:bg-muted text-foreground': sidebar.sortConfig.mode !== 'date',
              }"
              @click="setSortMode('date')"
            >
              <span
                class="icon-[lucide--calendar-clock] mr-3 size-4"
                :class="sidebar.sortConfig.mode === 'date' ? 'text-primary' : 'text-muted-foreground'"
              />
              按日期排序
            </button>
          </div>
        </div>
        <div class="border-t border-border/50 p-3">
          <div class="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            排序方向
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
              :class="{
                'bg-primary text-primary-foreground shadow-md shadow-primary/20': sidebar.sortConfig.direction === 'asc',
                'bg-muted text-muted-foreground hover:bg-muted/80': sidebar.sortConfig.direction !== 'asc',
              }"
              @click="setSortDirection('asc')"
            >
              <span class="icon-[lucide--arrow-up] size-3.5" />
              升序
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
              :class="{
                'bg-primary text-primary-foreground shadow-md shadow-primary/20': sidebar.sortConfig.direction === 'desc',
                'bg-muted text-muted-foreground hover:bg-muted/80': sidebar.sortConfig.direction !== 'desc',
              }"
              @click="setSortDirection('desc')"
            >
              <span class="icon-[lucide--arrow-down] size-3.5" />
              降序
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 搜索框 -->
    <div class="relative w-full p-3">
      <div class="relative group">
        <Input
          v-model="searchStr"
          placeholder="搜索笔记..."
          @keyup.enter="doSearch"
          class="h-10 pl-10 pr-4 bg-muted/50 border-transparent rounded-xl focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all duration-300"
        />
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span
            class="icon-[lucide--search] size-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
          />
        </span>
        <span
          v-if="searchStr"
          class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          @click="clearSearch"
        >
          <span class="icon-[lucide--x] size-4 text-muted-foreground hover:text-foreground transition-colors" />
        </span>
      </div>
    </div>

    <!-- 笔记管理区域 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- 工具栏 -->
      <div
        class="flex items-center justify-between px-3 py-2 mx-3 mb-2 rounded-xl bg-muted/30 border border-border/30"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
        :class="{
          'border-dashed border-primary/50 bg-primary/5': isDragOver,
        }"
      >
        <h2 class="text-sm font-medium text-foreground/80 pl-1">
          笔记管理
        </h2>
        <div class="flex gap-1">
          <!-- 排序配置按钮 -->
          <div class="relative" ref="sortMenuRef">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 rounded-lg hover:bg-background hover:shadow-sm transition-all duration-200"
              :class="{ 'bg-background shadow-sm': sortMenuOpen }"
              @click="toggleSortMenu"
            >
              <span
                class="icon-[lucide--arrow-up-down] size-4 text-muted-foreground"
                :class="{ 'text-primary': sortMenuOpen }"
              />
            </Button>
          </div>

          <!-- 新建按钮 -->
          <div class="relative" ref="menuRef">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 rounded-lg hover:bg-background hover:shadow-sm transition-all duration-200"
              @click="toggleMenu"
            >
              <span class="icon-[lucide--plus] size-4 text-primary" />
            </Button>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-1"
            >
              <div
                v-if="menuOpen"
                class="absolute right-0 top-full z-10 mt-2 min-w-[10rem] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md shadow-xl"
                @mousedown.stop
              >
                <div class="p-1.5 space-y-0.5">
                  <button
                    class="w-full flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-muted"
                    @click="onMenuItemClick('note')"
                  >
                    <span class="icon-[lucide--file-plus] mr-3 size-4 text-blue-500" />
                    新建笔记
                  </button>
                  <button
                    class="w-full flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-muted"
                    @click="onMenuItemClick('folder')"
                  >
                    <span class="icon-[lucide--folder-plus] mr-3 size-4 text-amber-500" />
                    新建笔记本
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 创建输入框 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="createInputShow" class="mx-3 mb-2">
          <div class="relative">
            <input
              ref="createInputRef"
              v-model="createName"
              :placeholder="createType === 'note' ? '输入笔记名称...' : '输入笔记本名称...'"
              class="w-full h-10 rounded-xl border border-primary/30 bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              @keyup.enter="doCreateItem"
              @keyup.esc="hideCreateInput"
              @keydown.stop
              @click.stop
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Esc</kbd>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 笔记本树 -->
      <ScrollArea ref="scrollAreaRef" class="flex-1 px-2">
        <div class="pb-4">
          <TreeRoot
            class="w-full select-none rounded-xl bg-background/50 p-1 text-sm"
            :items="sortedTrees"
            :get-key="item => item.key"
            :typeahead-search="false"
          >
            <Tree :tree-items="sortedTrees" />
          </TreeRoot>

          <!-- 空状态 -->
          <div v-if="sortedTrees.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <span class="icon-[lucide--folder-open] size-8 text-muted-foreground/50" />
            </div>
            <p class="text-sm text-muted-foreground">暂无笔记</p>
            <p class="text-xs text-muted-foreground/60 mt-1">点击 + 创建第一个笔记</p>
          </div>
        </div>
      </ScrollArea>
    </div>

    <!-- 底部工具栏 -->
    <Footer
      class="border-t border-border/50 bg-background/80 backdrop-blur-sm py-2.5"
    />
  </div>
</template>

<script setup lang="ts">
import { useSidebarStore, useSyncStore, usePreferenceStore } from '@/store'
import Menu from './menu.vue'
import { TreeRoot } from 'reka-ui'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const sidebar = useSidebarStore()
const sync = useSyncStore()

// 排序后的树数据
const sortedTrees = computed(() => {
  const trees = sidebar.inSearch ? sidebar.searchResult : sidebar.treeLabels
  return sidebar.getSortedTreeData(trees)
})

// 排序菜单控制
const sortMenuOpen = ref(false)
const sortMenuRef = ref<HTMLElement | null>(null)

const toggleSortMenu = () => {
  sortMenuOpen.value = !sortMenuOpen.value
}

const setSortMode = (mode: 'name' | 'date') => {
  sidebar.updateSortConfig({ mode })
  sortMenuOpen.value = false
}

const setSortDirection = (direction: 'asc' | 'desc') => {
  sidebar.updateSortConfig({ direction })
}

// 点击外部关闭排序菜单
const handleSortMenuClickOutside = (e: MouseEvent) => {
  if (
    sortMenuOpen.value &&
    sortMenuRef.value &&
    !sortMenuRef.value.contains(e.target as Node)
  ) {
    sortMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleSortMenuClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleSortMenuClickOutside)
})

onMounted(async () => {
  await sync.sync()
  document.addEventListener('dragover', handleDragScroll, { passive: true })
  document.addEventListener('dragend', clearScrollInterval)
  document.addEventListener('drop', clearScrollInterval)

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

const showCreateInput = (type: 'note' | 'folder') => {
  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }

  setTimeout(() => {
    createType.value = type
    createName.value = ''
    createInputShow.value = true

    nextTick(() => {
      if (createInputRef.value) {
        createInputRef.value.focus()
      }
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

const hideCreateInput = () => {
  createInputShow.value = false
  createName.value = ''

  if (clickOutsideHandler) {
    document.removeEventListener('mousedown', clickOutsideHandler)
    clickOutsideHandler = null
  }
}

let clickOutsideHandler: ((event: MouseEvent) => void) | null = null

const doCreateItem = async () => {
  const name = createName.value.trim()
  if (!name) {
    hideCreateInput()
    return
  }
  await sidebar.addNodeInTree('root', createType.value, name)

  hideCreateInput()

  setTimeout(async () => {
    await sidebar.loadNodeTree()
  }, 100)
}

// 搜索功能
const searchStr = ref('')
const doSearch = () => {
  sidebar.searchTreeNodes(searchStr.value)
}

const clearSearch = () => {
  searchStr.value = ''
  sidebar.exitSearch()
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
  if (!sidebar.currentDragNode) return
  if (sidebar.currentDragNode.parentId === 'root') return
  event.preventDefault()
  isDragOver.value = true
}

const onDragOver = (event: DragEvent) => {
  if (!event.dataTransfer) return
  if (!sidebar.currentDragNode) return
  if (sidebar.currentDragNode.parentId === 'root') return
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
    const dragData = sidebar.currentDragNode

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

    if (draggedNode.type === 'file') {
      await sidebar.moveNode({
        id: draggedNode.data.id,
        parentId: 'root',
      })
    } else if (draggedNode.type === 'folder') {
      await sidebar.moveFolder(draggedNode.key, 'root')
    }

    sidebar.clearDragNode()
    await sidebar.loadNodeTree()
  } catch (error) {
    console.error('拖拽处理错误:', error)
    sidebar.clearDragNode()
  }
}

const scrollAreaRef = ref<any>(null)
let scrollInterval: number | null = null
let cachedScrollElement: HTMLElement | null = null

const clearScrollInterval = () => {
  if (scrollInterval !== null) {
    window.clearInterval(scrollInterval)
    scrollInterval = null
  }
}

const handleDragScroll = (event: DragEvent) => {
  const scrollElement = cachedScrollElement || findScrollableElement()
  if (!scrollElement) return

  const rect = scrollElement.getBoundingClientRect()
  const sensitiveAreaHeight = 80
  const topDistance = event.clientY - rect.top
  const bottomDistance = rect.bottom - event.clientY

  clearScrollInterval()

  try {
    if (topDistance >= 0 && topDistance < sensitiveAreaHeight) {
      const speed = Math.max(1, Math.floor((sensitiveAreaHeight - topDistance) / 10)) * 3
      scrollInterval = window.setInterval(() => {
        if (scrollElement && typeof scrollElement.scrollTop === 'number') {
          scrollElement.scrollTop -= speed
        } else {
          clearScrollInterval()
        }
      }, 16)
    } else if (bottomDistance >= 0 && bottomDistance < sensitiveAreaHeight) {
      const speed = Math.max(1, Math.floor((sensitiveAreaHeight - bottomDistance) / 10)) * 3
      scrollInterval = window.setInterval(() => {
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

const findScrollableElement = (): HTMLElement | null => {
  if (!scrollAreaRef.value) return null

  try {
    const viewport = document.querySelector('[data-reka-scroll-area-viewport]')
    if (viewport && viewport instanceof HTMLElement) {
      return viewport
    }

    const scrollContainer = document.querySelector('.scrollbar')?.parentElement
    if (scrollContainer && scrollContainer instanceof HTMLElement) {
      return scrollContainer
    }

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
</script>

<style scoped>
:deep(.scrollbar) {
  @apply w-1.5 rounded-full bg-transparent;
}

:deep(.scrollbar-thumb) {
  @apply rounded-full bg-muted-foreground/20 transition-all duration-300;
}

:deep(.scrollbar-thumb:hover) {
  @apply bg-muted-foreground/40;
}
</style>
