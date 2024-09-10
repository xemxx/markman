<template>
  <div v-show="toggleSidebar" class="flex flex-col">
    <div class="flex-none h-10 border-b">
      <Menu />
    </div>
    <div class="flex-none w-full p-1">
      <input
        v-model="searchStr"
        placeholder="搜索笔记"
        @keyup.enter="doSearch"
        class="w-full px-3 py-2 text-sm rounded-md bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
    <div class="flex flex-col flex-1 h-full px-0 py-1 overflow-auto">
      <div
        class="flex justify-between px-2 py-1 transition-colors duration-300 hover:bg-gray-100 group"
      >
        <h2 class="text-lg font-semibold tracking-tight">笔记管理</h2>
        <div class="relative grid grid-cols-1 place-content-center group/tip">
          <span
            class="icon-[lucide--folder-plus] size-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            @click="showAddBook"
          ></span>
          <span
            class="absolute px-2 py-1 text-sm text-white transition-opacity duration-300 transform bg-gray-700 rounded opacity-0 group-hover/tip:z-50 delay-0 -translate-x-3/4 top-full w-max group-hover/tip:opacity-80"
          >
            新建笔记本
          </span>
        </div>
      </div>
      <ScrollArea class="flex flex-1 w-full">
        <div v-show="bookInputShow" class="px-2 py-1">
          <input
            placeholder="未命名"
            ref="bookInputRef"
            class="flex w-full h-8 px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            v-model="bookName"
            @keyup.enter="doAddBook"
            @blur="blurAddBook"
          />
        </div>
        <TreeRoot
          class="w-full p-1 text-sm font-medium list-none rounded-lg select-none bg-background text-blackA11"
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
import { usePreferenceStore } from '@/store/preference'
import { storeToRefs } from 'pinia'
import Menu from './menu.vue'
import Footer from './footer.vue'
import { TreeRoot } from 'radix-vue'
import Tree from './tree.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
const preference = usePreferenceStore()
const { toggleSidebar } = storeToRefs(preference)

import { useSidebarStore } from '@/store/sidebar'
import { ref, nextTick, useTemplateRef, computed, watch } from 'vue'
import { Input } from '@/components/ui/input'

const sidebar = useSidebarStore()
sidebar.loadNodeTree()
const trees = computed(() => {
  if (sidebar.inSearch) {
    return sidebar.searchResult
  }
  return sidebar.treeLabels
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
    await sidebar.addNotebook(name)
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
