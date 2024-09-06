<template>
  <div
    class="flex items-center h-8 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4 group"
    @click="onNodeSelect(item)"
  >
    <template v-if="item.children">
      <span v-if="!isExpanded" class="size-5 icon-[lucide--folder] flex-none" />
      <span v-else class="size-5 icon-[lucide--folder-open] flex-none" />
    </template>
    <span v-else class="size-5 icon-[ion--document-text-outline] flex-none" />
    <div class="flex flex-1 pl-2 truncate group">
      <input
        v-if="renameKey == item.key"
        ref="bookRenameInputRef"
        v-model="bookReName"
        @blur="blurRenameBook(item)"
        @keyup.enter="doRenameBook(item)"
        @keydown.stop
        class="flex w-full h-8 p-2 text-sm border bg-background focus:outline-none focus:border-1"
        @click.stop
        @focus="console.log('input focus')"
      />
      <template v-else>
        <div class="flex-1 w-full overflow-hidden">
          <ContextMenu>
            <ContextMenuTrigger>
              <div class="truncate">
                <span>{{ item.label }}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent v-if="item.children">
              <ContextMenuItem @click.stop="renameBook(item)"
                >重命名</ContextMenuItem
              >
              <ContextMenuItem @click.stop="onDeleteFolder(item)">
                删除
              </ContextMenuItem>
            </ContextMenuContent>
            <ContextMenuContent v-else>
              <ContextMenuItem @click.stop="moveNote(item)">
                移动
              </ContextMenuItem>
              <ContextMenuItem @click.stop="onDeleteNote(item)">
                删除
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
        <div
          class="grid flex-none grid-cols-1 transition-opacity duration-300 opacity-0 place-content-center group-hover:opacity-100"
          @click.stop
          v-if="item.children"
        >
          <span
            class="icon-[lucide--plus] size-5"
            @click="addNode(item)"
          ></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useSidebarStore } from '@/store/sidebar'
import { TreeNode } from './types'
const sidebar = useSidebarStore()
const props = defineProps<{
  item: TreeNode
  isExpanded: boolean
}>()

// load note
import { useEditorStore } from '@/store/editor'
const editor = useEditorStore()
const onNodeSelect = (node: any) => {
  if (node.data.title) {
    editor.checkoutNote(node.data.id)
  }
}

// right click
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { nextTick } from 'process'
// rename book
const bookReName = ref('')
const renameOld = ref('')
const renames = ref({})
const renameKey = ref('')
const bookRenameInputRef = useTemplateRef('bookRenameInputRef')
const renameBook = (node: TreeNode) => {
  let name = ''
  if (node.data.title) {
    name = node.data.title
  } else {
    name = node.data.name
  }
  renameOld.value = name
  bookReName.value = name
  renames.value[node.key] = true
  renameKey.value = node.key
  nextTick(() => {
    // bookRenameInputRef.value?.focus()
  })
}
const doRenameBook = async (node: TreeNode) => {
  console.log('doRename')
  if (bookReName.value != '' && bookReName.value != renameOld.value) {
    console.log(bookReName.value)
    await sidebar.updateNotebook({ id: node.data.id, name: bookReName.value })
    await sidebar.loadNodeTree()
  }
  blurRenameBook(node)
}
const blurRenameBook = (node: TreeNode) => {
  renames.value[node.key] = false
  bookReName.value = ''
  renameKey.value = ''
  console.log('blur')
}
// delete folder
const onDeleteFolder = async (node: TreeNode) => {
  await sidebar.deleteNotebook(node.data.id)
  await sidebar.loadNodeTree()
}

// add note
const addNode = (node: TreeNode) => {
  editor.addNote(node.data.guid)
  sidebar.loadNodeTree()
}

// delete note
const onDeleteNote = (node: TreeNode) => {
  editor.deleteNote(node.data.id)
  sidebar.loadNodeTree()
}

// move note
let moveNoteId = 0

const moveNote = (node: TreeNode) => {
  // moveNoteId = id
  // moveCheck.value = bid
  // showMove.value = true
}
// const doMove = () => {
//   sidebar.moveNote({
//     id: moveNoteId,
//     bid: moveCheck.value,
//   })
//   showMove.value = false
// }
</script>
