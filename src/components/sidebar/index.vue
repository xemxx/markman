<template>
  <div v-show="toggleSidebar" class="flex flex-col">
    <div class="flex-none h-10 border-b">
      <Menu />
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
            class="flex w-full h-8 px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            v-model="bookName"
            @keyup.enter="doAddBook"
            @blur="blurAddBook"
          />
        </div>
        <TreeRoot
          v-slot="{ flattenItems }"
          class="w-full p-1 pr-3 text-sm font-medium list-none bg-white rounded-lg select-none text-blackA11"
          :items="treeLabels"
          :get-key="item => item.key"
        >
          <TreeItem
            v-for="item in flattenItems"
            v-slot="{ isExpanded }"
            :key="item._id"
            :style="{ 'padding-left': `${item.level - 0.5}rem` }"
            v-bind="item.bind"
            class="flex items-center py-1 px-2 my-0.5 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4 group"
            @click.stop="onNodeSelect(item.value)"
          >
            <Input
              :focus="renames[item._id] ?? false"
              v-if="renames[item._id]"
              v-model="bookReName"
              @blur="blurRenameBook(item.value)"
              @keyup.enter="doRenameBook(item.value)"
              class="w-full h-6"
            />

            <template v-else>
              <template v-if="item.hasChildren">
                <span
                  v-if="!isExpanded"
                  class="size-5 icon-[lucide--folder] flex-none"
                />
                <span
                  v-else
                  class="size-5 icon-[lucide--folder-open] flex-none"
                />
              </template>
              <span
                v-else
                class="size-5 icon-[ion--document-text-outline] flex-none"
              />
              <div class="flex-1 pl-2 truncate">
                <ContextMenu>
                  <ContextMenuTrigger>
                    {{ item.value.label }}
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem @click="renameBook(item.value)"
                      >重命名</ContextMenuItem
                    >
                    <ContextMenuItem @click="sidebar.deleteNotebook(item.value)"
                      >删除</ContextMenuItem
                    >
                  </ContextMenuContent>
                </ContextMenu>
              </div>
              <div
                class="grid grid-cols-1 transition-opacity duration-300 opacity-0 place-content-center group-hover:opacity-100"
              >
                <span class="icon-[lucide--plus]"></span>
              </div>
            </template>
          </TreeItem>
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
import { TreeItem, TreeRoot } from 'radix-vue'

const preference = usePreferenceStore()
const { toggleSidebar } = storeToRefs(preference)

import { useSidebarStore } from '@/store/sidebar'
import { ref, computed, onMounted, nextTick, useTemplateRef } from 'vue'

onMounted(() => {
  sidebar.loadNodeTree()
})

const sidebar = useSidebarStore()
const treeLabels = computed(() => {
  return sidebar.noteTree.map(item => {
    return {
      label: item.book.name,
      icon: 'icon-[ion--folder-outline]',
      data: item.book,
      key: item.book.guid,
      rename: false,
      children: item.notes.map(child => {
        return {
          label: child.title,
          icon: 'icon-[ion--document-text-outline]',
          data: child,
          key: child.guid,
          rename: false,
        }
      }),
    }
  })
})

import { useEditorStore } from '@/store/editor'
const editor = useEditorStore()
const onNodeSelect = (node: any) => {
  if (node.data.title) {
    editor.checkoutNote(node.data.id)
  }
}

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

// right click
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
// rename book
const bookReName = ref('')
const renameOld = ref('')
const renames = ref({})
const renameBook = node => {
  let name = ''
  if (node.data.title) {
    name = node.data.title
  } else {
    name = node.data.name
  }
  renameOld.value = name
  bookReName.value = name
  renames.value[node.key] = true
  console.log(renames.value)
}
const doRenameBook = node => {
  if (bookReName.value != '' && bookReName.value != renameOld.value) {
    console.log(bookReName.value)
    sidebar.updateNotebook({ id: node.data.id, name: bookReName.value })
    sidebar.loadNodeTree()
  }
  blurRenameBook(node)
}
const blurRenameBook = node => {
  renames.value[node.key] = false
  bookReName.value = ''
}
</script>
<style scoped></style>
