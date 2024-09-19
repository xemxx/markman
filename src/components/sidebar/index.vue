<template>
  <div
    v-show="toggleSidebar"
    class="flex flex-col bg-background text-foreground"
  >
    <div class="h-9 flex-none border-b">
      <Menu />
    </div>

    <div class="relative w-full max-w-sm flex-none items-center p-1">
      <Input
        v-model="searchStr"
        placeholder="搜索笔记"
        @keyup.enter="doSearch"
        class="pl-10"
      />
      <span
        class="absolute inset-y-0 start-0 flex items-center justify-center px-2"
      >
        <span class="icon-[lucide--search] size-6 text-muted-foreground" />
      </span>
    </div>
    <div class="flex h-full flex-1 flex-col overflow-auto px-0 py-1">
      <div
        class="group flex justify-between px-2 py-1 transition-colors duration-300 hover:bg-gray-100"
      >
        <h2 class="text-lg font-semibold tracking-tight">笔记管理</h2>
        <div class="group/tip relative grid grid-cols-1 place-content-center">
          <span
            class="icon-[lucide--folder-plus] size-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            @click="showAddBook"
          ></span>
          <span
            class="absolute top-full w-max -translate-x-3/4 transform rounded bg-gray-700 px-2 py-1 text-sm text-white opacity-0 transition-opacity delay-0 duration-300 group-hover/tip:z-50 group-hover/tip:opacity-80"
          >
            新建笔记本
          </span>
        </div>
      </div>
      <ScrollArea class="flex w-full flex-1" type="hover" :scrollHideDelay="0">
        <div v-show="bookInputShow" class="px-2 py-1">
          <input
            placeholder="未命名"
            ref="bookInputRef"
            class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            v-model="bookName"
            @keyup.enter="doAddBook"
            @blur="blurAddBook"
          />
        </div>
        <TreeRoot
          class="w-full select-none list-none rounded-lg bg-background p-1 text-sm font-medium text-black"
          :items="trees"
          :get-key="item => item.key"
        >
          <Tree :tree-items="trees" />
        </TreeRoot>
      </ScrollArea>
    </div>
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
import { ScrollArea } from '@/components/ui/scroll-area'
const preference = usePreferenceStore()
const { toggleSidebar } = storeToRefs(preference)

import { ref, nextTick, useTemplateRef, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'

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
  sidebar.loadNodeTree()
})

// add book
const bookInputShow = ref(false)
const bookName = ref('')
const bookInputRef = useTemplateRef('bookInputRef')
const showAddBook = () => {
  bookInputShow.value = true
  nextTick(() => {
    bookInputRef.value?.focus()
  })
}
const blurAddBook = () => {
  bookInputShow.value = false
  bookName.value = ''
}
const doAddBook = async () => {
  const name = bookName.value
  if (name == '') {
    blurAddBook()
  } else {
    // 添加到本地数据库和显示列表
    await sidebar.addFolder(name)
    await sidebar.loadNodeTree()
    blurAddBook()
  }
}

// search
const searchStr = ref('')
const doSearch = () => {
  sidebar.searchTreeNodes(searchStr.value)
}

watch(searchStr, newVal => {
  if (newVal == '') {
    sidebar.exitSearch()
  }
})
</script>
<style scoped></style>
