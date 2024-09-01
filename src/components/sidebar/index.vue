<template>
  <div v-show="toggleSidebar" class="flex flex-col">
    <div class="flex-none border-b">
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
          ></span>
          <span
            class="absolute z-50 px-2 py-1 text-sm text-white transition-opacity duration-300 transform bg-gray-700 rounded opacity-0 delay-0 -translate-x-3/4 top-full w-max group-hover/tip:opacity-80"
          >
            新建笔记本
          </span>
        </div>
      </div>
      <ScrollArea class="flex flex-1 w-full">
        <Tree
          v-model:selectionKeys="selectedItem"
          v-model:expandedKeys="expandedKeys"
          :value="treeLabels"
          class="w-full pr-2"
          selectionMode="multiple"
          :metaKeySelection="true"
          @nodeSelect="onNodeSelect"
        ></Tree>
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

const preference = usePreferenceStore()
const { toggleSidebar } = storeToRefs(preference)

import { useSidebarStore } from '@/store/sidebar'
import { ref, computed, onMounted } from 'vue'
import Tree from 'primevue/tree'

onMounted(() => {
  sidebar.loadNodeTree()
})

const sidebar = useSidebarStore()
const selectedItem = ref('')
const treeLabels = computed(() => {
  return sidebar.noteTree.map(item => {
    return {
      label: item.book.name,
      icon: 'icon-[ion--folder-outline]',
      data: item.book,
      key: item.book.guid,
      children: item.notes.map(child => {
        return {
          label: child.title,
          icon: 'icon-[ion--document-text-outline]',
          data: child,
          key: child.guid,
        }
      }),
    }
  })
})

import { useEditorStore } from '@/store/editor'
const editor = useEditorStore()
const onNodeSelect = (node: { label: any; title: any; data: any }) => {
  if (node.data.title) {
    editor.checkoutNote(node.data.id)
  } else {
    expandNode(node)
  }
}
const expandedKeys = ref({})
const expandNode = (node: {
  label?: any
  title?: any
  data?: any
  children?: any
  key?: any
}) => {
  if (node.children && node.children.length) {
    if (expandedKeys.value[node.key]) {
      expandedKeys.value[node.key] = !expandedKeys.value[node.key]
    } else {
      expandedKeys.value[node.key] = true
    }
  }
}
</script>

<style scoped></style>
