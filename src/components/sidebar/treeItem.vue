<script lang="ts" setup>
import { TreeItem } from 'radix-vue'
import Tree from './tree.vue'
import { TreeNode } from './types'
const props = defineProps<{
  tree: TreeNode
  level: number
  selected: boolean
}>()

const emits = defineEmits(['onDeleteNode'])

import { ref, useTemplateRef } from 'vue'
import { useSidebarStore } from '@/store'
const sidebar = useSidebarStore()

// load note
import { useEditorStore } from '@/store'
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
const nodeRename = ref('')
const nodeNameOrigin = ref('')
const inRenameMode = ref<boolean>(false)
const nodeRenameInputRef = useTemplateRef('nodeRenameInputRef')

const renameNode = (node: TreeNode) => {
  let name = ''
  if (node.data.title) {
    name = node.data.title
  } else {
    name = node.data.name
  }
  nodeNameOrigin.value = name
  nodeRename.value = name
  inRenameMode.value = true
  nextTick(() => {
    // 必须使用setTimeout，否则无法获取焦点，会被contextMenu的事件覆盖
    setTimeout(() => {
      nodeRenameInputRef.value?.focus()
    }, 0)
  })
}

const doRenameNode = async (node: TreeNode) => {
  if (nodeRename.value == '' || nodeRename.value == nodeNameOrigin.value) {
    blurRenameBook()
    return
  }
  if (node.type == 'folder') {
    await sidebar.updateFolder({ id: node.data.id, name: nodeRename.value })
  } else {
    await sidebar.updateNote({ id: node.data.id, title: nodeRename.value })
  }
  sidebar.renameTreeNode(props.tree, nodeRename.value)
  blurRenameBook()
  // TODO 修复重命名后，再次重命名不会刷新input内的值的问题，需要重新loadNodeTree
  sidebar.loadNodeTree()
}
const blurRenameBook = () => {
  nodeRename.value = ''
  inRenameMode.value = false
}
// delete folder
const onDeleteFolder = async (node: TreeNode) => {
  await sidebar.deleteFolder(node.data.id)
  sidebar.deleteTreeNode(node)
}

const treeItemRef = useTemplateRef('treeItemRef')
// add note
const addNode = async (node: TreeNode) => {
  const noteGuid = await sidebar.addNoteInFolder(node.data.guid)
  if (noteGuid) {
    await sidebar.addTreeNode(node, noteGuid)
  }
  if (!treeItemRef.value?.isExpanded) {
    treeItemRef.value?.handleToggle()
  }
  // TODO 选中新建的笔记
}

// delete note
const onDeleteNote = async (node: TreeNode) => {
  await sidebar.deleteNote(node.data.id)
  sidebar.deleteTreeNode(node)
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { storeToRefs } from 'pinia'

const moveCheck = ref(props.tree.data.bid)

const { notebooks } = storeToRefs(sidebar)

const doMove = () => {
  sidebar.moveNote({
    id: props.tree.data.id,
    bid: moveCheck.value,
  })
  sidebar.moveTreeNode(props.tree, moveCheck.value)
}
</script>

<template>
  <TreeItem
    ref="treeItemRef"
    v-slot="{ isExpanded }"
    as-child
    :level="level"
    :value="tree"
  >
    <div
      class="group my-0.5 flex items-center rounded outline-none focus:ring-2 focus:ring-ring data-[selected]:bg-secondary"
      :style="{ 'padding-left': `${level == 0 ? 0.3 : level - 0.3}rem` }"
      @click="onNodeSelect(tree)"
    >
      <template v-if="tree.type == 'folder'">
        <span
          v-if="!isExpanded"
          class="icon-[lucide--folder] size-5 flex-none"
        />
        <span v-else class="icon-[lucide--folder-open] size-5 flex-none" />
      </template>
      <span v-else class="icon-[ion--document-text-outline] size-5 flex-none" />
      <div class="group flex flex-1 overflow-hidden">
        <input
          v-if="inRenameMode"
          ref="nodeRenameInputRef"
          v-model="nodeRename"
          @keyup.enter="doRenameNode(tree)"
          @keydown.stop
          class="focus:border-1 flex-1 rounded-sm border border-input bg-background py-2 pl-1 focus:outline-none"
          @click.stop
        />
        <template v-else>
          <div class="flex-1 truncate pl-1">
            <Dialog>
              <ContextMenu>
                <ContextMenuTrigger as-child>
                  <div class="flex w-full py-2">
                    <span class="truncate"> {{ tree.label }}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent v-if="tree.type == 'folder'">
                  <ContextMenuItem @click.stop="renameNode(tree)"
                    >重命名</ContextMenuItem
                  >
                  <ContextMenuItem @click.stop="onDeleteFolder(tree)">
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
                <ContextMenuContent v-else>
                  <ContextMenuItem @click.stop="renameNode(tree)"
                    >重命名</ContextMenuItem
                  >
                  <DialogTrigger asChild>
                    <ContextMenuItem>
                      <span>移动</span>
                    </ContextMenuItem>
                  </DialogTrigger>
                  <ContextMenuItem @click.stop="onDeleteNote(tree)">
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>移动文件夹</DialogTitle>
                  <DialogDescription>
                    <Select v-model="moveCheck">
                      <SelectTrigger>
                        <SelectValue placeholder="选择一个文件夹" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem
                            v-for="item in notebooks"
                            :value="item.guid"
                          >
                            {{ item.name }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button key="submit" type="primary" @click="doMove"
                    >确 定</Button
                  >
                  <DialogClose as-child>
                    <Button key="back">取 消</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div
            class="grid flex-none grid-cols-1 place-content-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            @click.stop
            v-show="tree.type == 'folder' && !inRenameMode"
          >
            <span
              class="icon-[lucide--plus] size-5"
              @click="addNode(tree)"
            ></span>
          </div>
        </template>
      </div>
    </div>
    <ul v-if="isExpanded && tree.children">
      <Tree :tree-items="tree.children" :level="level + 1" />
    </ul>
  </TreeItem>
</template>
