<script lang="ts" setup>
import { TreeItem } from 'radix-vue'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
const props = defineProps<{
  tree: TreeNode
  level: number
  selected: boolean
}>()

const emits = defineEmits(['onDeleteNode'])

import { ref, useTemplateRef, nextTick, onMounted } from 'vue'
import { useSidebarStore } from '@/store'
const sidebar = useSidebarStore()

// load note
import { useEditorStore } from '@/store'
const editor = useEditorStore()
const onNodeSelect = (node: TreeNode) => {
  if (node.type == 'file') {
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
// rename book
const nodeRename = ref('')
const nodeNameOrigin = ref('')
const inRenameMode = ref<boolean>(false)
const nodeRenameInputRef = useTemplateRef('nodeRenameInputRef')

// 统一获取节点名称
const getNodeName = (node: TreeNode): string => {
  return node.type === 'folder' ? node.data.name : node.data.title
}

// 统一设置节点名称
const setNodeName = (node: TreeNode, newName: string): void => {
  if (node.type === 'folder') {
    node.data.name = newName
  } else {
    node.data.title = newName
  }
}

// 检查当前节点是否需要重命名
const checkShouldRename = () => {
  // 如果是新创建的节点，自动进入重命名模式
  if (props.tree.isNew) {
    renameNode(props.tree)
    // 重命名后清除 isNew 标记
    props.tree.isNew = false
  }
}

// 当组件挂载时检查
onMounted(checkShouldRename)

const renameNode = (node: TreeNode) => {
  // 使用统一的方式获取节点名称
  const name = getNodeName(node)
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
  // 更新树节点名称
  sidebar.renameTreeNode(props.tree, nodeRename.value)

  // 更新本地节点数据，使用统一的方式设置
  setNodeName(node, nodeRename.value)

  blurRenameBook()
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

const treeItemRef = useTemplateRef<HTMLElement>('treeItemRef')
// add note
const addNode = async (node: TreeNode) => {
  // 验证节点是否可以添加子节点
  if (!sidebar.canAddChildren(node)) {
    console.warn('此节点不能添加子节点')
    return
  }

  const noteGuid = await sidebar.addNoteInFolder(node.data.guid)
  if (noteGuid) {
    // 添加新节点并获取返回的节点
    const newNode = await sidebar.addTreeNode(node, noteGuid)

    // 确保文件夹是展开的
    if (!treeItemRef.value?.isExpanded) {
      treeItemRef.value?.handleToggle()
    }
  }
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
  DialogClose,
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

const moveCheck = ref(props.tree.data.parentId || 'root')

const { rootNodes: notebooks } = storeToRefs(sidebar)

const doMove = async () => {
  // 移动文件
  await sidebar.moveNote({
    id: props.tree.data.id,
    parentId: moveCheck.value,
  })

  // 更新节点的父节点ID
  props.tree.parentId = moveCheck.value

  // 如果移动到根目录，需要重新加载树结构
  if (moveCheck.value === 'root') {
    // 从当前位置移除节点
    sidebar.deleteTreeNode(props.tree)

    // 重新加载树结构
    await sidebar.loadNodeTree()
  } else {
    // 非根目录移动使用常规移动方法
    sidebar.moveTreeNode(props.tree, moveCheck.value)
  }
}

// 拖拽相关的状态
const isDragging = ref(false)
const isDragOver = ref(false)
// 不再使用本地的currentDragNode变量，改用sidebar store中的状态

// 拖拽开始时设置拖拽数据
const onDragStart = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return

  // 创建拖拽数据
  const dragData = {
    key: node.key,
    type: node.type,
    parentId: node.parentId || '',
    label: node.label,
  }

  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify(dragData))

  // 记录当前正在拖拽的节点到全局状态
  sidebar.setDragNode(dragData)

  // 添加自定义的拖拽图像
  const dragImage = document.createElement('div')
  dragImage.classList.add('drag-image')
  dragImage.textContent = node.label
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 0, 0)

  // 标记为正在拖拽
  isDragging.value = true

  // 设置延迟以确保拖拽图像生效
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)
}

// 拖拽结束时清除状态
const onDragEnd = () => {
  isDragging.value = false
  sidebar.clearDragNode()
}

// 当拖拽进入目标时
const onDragEnter = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return

  // 如果没有正在拖拽的节点，返回
  if (!sidebar.currentDragNode) return

  if (sidebar.currentDragNode.parentId === node.key) return

  // 不允许拖拽到自己上
  if (sidebar.currentDragNode.key === node.key) return

  // 不允许拖拽到自己的子节点上（防止循环引用）
  if (sidebar.isDescendantOf(node.key, sidebar.currentDragNode.key)) {
    // console.warn('不能将节点拖放到其子节点上（会造成循环引用）')
    return
  }

  // 检查节点是否可以包含子节点
  if (sidebar.canAddChildren(node)) {
    event.preventDefault()
    isDragOver.value = true
  }
}

// 当拖拽在目标上方时
const onDragOver = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return

  // 如果没有正在拖拽的节点，返回
  if (!sidebar.currentDragNode) return

  // 不允许拖拽到自己上
  if (sidebar.currentDragNode.key === node.key) return

  if (sidebar.currentDragNode.parentId === node.key) return

  // 不允许拖拽到自己的子节点上（防止循环引用）
  if (sidebar.isDescendantOf(node.key, sidebar.currentDragNode.key)) return

  // 检查节点是否可以包含子节点
  if (sidebar.canAddChildren(node)) {
    event.preventDefault()
    isDragOver.value = true
  }
}

// 当拖拽离开目标时
const onDragLeave = () => {
  isDragOver.value = false
}

// 当放置拖拽项时
const onDrop = async (event: DragEvent, targetNode: TreeNode) => {
  event.preventDefault()
  isDragOver.value = false

  // 只有文件夹或可以包含子节点的文件可以作为放置目标
  if (!sidebar.canAddChildren(targetNode)) return

  if (!event.dataTransfer) return

  try {
    console.log('处理拖拽')
    // 获取拖拽的节点数据
    const dragData = JSON.parse(
      event.dataTransfer.getData('application/json'),
    ) as { key: string; type: string; parentId: string; label: string }

    // 不允许拖拽到自己上
    if (dragData.key === targetNode.key) return

    // 不允许拖拽到自己的子节点上（防止循环引用）
    // 使用sidebar中的isDescendantOf方法来精确检测循环引用
    if (sidebar.isDescendantOf(targetNode.key, dragData.key)) {
      console.warn('不能将节点拖放到其子节点上（会造成循环引用）')
      return
    }
    console.log('找拖拽节点')
    // 找到拖拽的节点
    const draggedNode = findNodeByKey(sidebar.treeLabels, dragData.key)
    if (!draggedNode) return
    if (draggedNode.parentId == targetNode.key) return
    console.log('移动节点')
    // 执行移动操作
    if (draggedNode.type === 'file') {
      // 移动文件
      await sidebar.moveNote({
        id: draggedNode.data.id,
        parentId: targetNode.data.guid,
      })

      // 更新节点的父节点ID
      draggedNode.parentId = targetNode.key
      // 更新树结构
      sidebar.moveTreeNode(draggedNode, targetNode.key)
    } else if (draggedNode.type === 'folder') {
      console.log('移动文件夹')
      // 移动文件夹
      await sidebar.moveFolder(draggedNode.key, targetNode.key)

      // 刷新树以确保正确显示
      await sidebar.loadNodeTree()
    }
  } catch (error) {
    console.error('拖拽处理错误:', error)
  }
}

// 在树中查找节点
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
      class="group my-0.5 flex items-center rounded-md px-2 py-1 outline-none transition-colors hover:bg-muted/50 data-[selected]:bg-muted"
      :style="{ 'padding-left': `${level * 1.5 + 0.5}rem` }"
      @click="onNodeSelect(tree)"
      draggable="true"
      @dragstart="onDragStart($event, tree)"
      @dragend="onDragEnd"
      @dragenter="onDragEnter($event, tree)"
      @dragover="onDragOver($event, tree)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, tree)"
      :class="{
        'opacity-50': isDragging,
        'border-2 border-dashed border-ring bg-muted/80': isDragOver,
      }"
    >
      <template v-if="tree.type === 'folder'">
        <span
          v-if="!isExpanded"
          class="icon-[lucide--folder] size-5 flex-none text-muted-foreground"
        />
        <span
          v-else
          class="icon-[lucide--folder-open] size-5 flex-none text-muted-foreground"
        />
      </template>
      <template v-else>
        <!-- 所有文件节点使用文档图标 -->
        <span
          class="icon-[ion--document-text-outline] size-5 flex-none text-muted-foreground"
        />
      </template>
      <div class="flex items-center flex-1 overflow-hidden group">
        <input
          v-if="inRenameMode"
          ref="nodeRenameInputRef"
          v-model="nodeRename"
          @keyup.enter="doRenameNode(tree)"
          @blur="blurRenameBook"
          @keydown.stop
          class="flex-1 px-2 py-1 text-sm border rounded-sm border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @click.stop
        />
        <template v-else>
          <div class="flex-1 pl-2 truncate">
            <Dialog>
              <ContextMenu>
                <ContextMenuTrigger as-child>
                  <div class="flex items-center w-full">
                    <span class="text-sm truncate">{{ tree.label }}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent v-if="tree.type === 'folder'">
                  <ContextMenuItem @click.stop="renameNode(tree)">
                    <span class="icon-[lucide--pencil] mr-2 size-4" />
                    重命名
                  </ContextMenuItem>
                  <ContextMenuItem @click.stop="onDeleteFolder(tree)">
                    <span class="icon-[lucide--trash-2] mr-2 size-4" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
                <ContextMenuContent v-else>
                  <ContextMenuItem @click.stop="renameNode(tree)">
                    <span class="icon-[lucide--pencil] mr-2 size-4" />
                    重命名
                  </ContextMenuItem>
                  <DialogTrigger asChild>
                    <ContextMenuItem>
                      <span class="icon-[lucide--folder-input] mr-2 size-4" />
                      移动
                    </ContextMenuItem>
                  </DialogTrigger>
                  <ContextMenuItem @click.stop="onDeleteNote(tree)">
                    <span class="icon-[lucide--trash-2] mr-2 size-4" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>移动笔记</DialogTitle>
                  <DialogDescription>
                    <Select v-model="moveCheck">
                      <SelectTrigger>
                        <SelectValue placeholder="选择一个文件夹" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="root">根目录</SelectItem>
                          <SelectItem
                            v-for="item in notebooks"
                            :key="item.guid"
                            :value="item.guid"
                          >
                            {{ item.title }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button key="submit" type="primary" @click="doMove">
                    确 定
                  </Button>
                  <DialogClose as-child>
                    <Button key="back">取 消</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div
            class="grid flex-none grid-cols-1 transition-opacity duration-300 opacity-0 place-content-center group-hover:opacity-100"
            @click.stop
            v-show="!inRenameMode"
          >
            <Button
              variant="ghost"
              size="icon"
              class="w-6 h-6"
              @click="addNode(tree)"
            >
              <span class="icon-[lucide--plus] size-4" />
            </Button>
          </div>
        </template>
      </div>
    </div>
    <ul v-if="isExpanded && tree.children">
      <Tree :tree-items="tree.children" :level="level + 1" />
    </ul>
  </TreeItem>
</template>

<style scoped>
.drag-image {
  padding: 4px 8px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--foreground);
  font-size: 14px;
}
</style>
