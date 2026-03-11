<script lang="ts" setup>
import { TreeItem } from 'reka-ui'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  tree: TreeNode
  level: number
  selected: boolean
  sortedTrees: TreeNode[]
}>()

import {
  ref,
  computed,
  watch,
  useTemplateRef,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import { useSidebarStore } from '@/store'
const sidebar = useSidebarStore()

import { useEditorStore } from '@/store'
const editor = useEditorStore()

const isNodeSelected = computed(() => sidebar.isSelected(props.tree.key))
const isMultiSelected = computed(() => sidebar.selectedKeys.length > 1)

const handleClick = (event: MouseEvent, node: TreeNode) => {
  const isMeta = event.metaKey || event.ctrlKey
  const isShift = event.shiftKey

  if (isMeta) {
    event.stopPropagation()
    event.preventDefault()
    sidebar.toggleSelectNode(node.key)
  } else if (isShift) {
    event.stopPropagation()
    event.preventDefault()
    sidebar.selectRange(node.key, props.sortedTrees)
  } else {
    sidebar.selectNode(node.key)
    if (node.type === 'file') {
      editor.checkoutNote(node.data.id)
    }
  }
}

const handleContextMenu = (node: TreeNode) => {
  if (!sidebar.isSelected(node.key)) {
    sidebar.selectNode(node.key)
  }
}

import CustomContextMenu from './CustomContextMenu.vue'
import CustomContextMenuItem from './CustomContextMenuItem.vue'

const nodeRename = ref('')
const nodeNameOrigin = ref('')
const inRenameMode = ref<boolean>(false)
const nodeRenameInputRef = useTemplateRef<HTMLInputElement>('nodeRenameInputRef')

const getNodeName = (node: TreeNode): string => {
  return node.data.title
}

const setNodeName = (node: TreeNode, newName: string): void => {
  node.data.title = newName
}

const checkShouldRename = () => {
  if (props.tree.isNew) {
    renameNode(props.tree)
    props.tree.isNew = false
  }
}

onMounted(checkShouldRename)

const renameNode = (node: TreeNode) => {
  const name = getNodeName(node)
  nodeNameOrigin.value = name
  nodeRename.value = name
  inRenameMode.value = true
  nextTick(() => {
    setTimeout(() => {
      if (nodeRenameInputRef.value) {
        nodeRenameInputRef.value.focus()
        nodeRenameInputRef.value.select()
      }
    }, 50)
  })
}

const doRenameNode = async (node: TreeNode) => {
  if (nodeRename.value === '') {
    nodeRename.value = nodeNameOrigin.value
    blurRenameBook()
    return
  }
  if (nodeRename.value === nodeNameOrigin.value) {
    blurRenameBook()
    return
  }

  try {
    if (node.type == 'folder') {
      await sidebar.updateFolder({ id: node.data.id, name: nodeRename.value })
    } else {
      await sidebar.updateNote({ id: node.data.id, title: nodeRename.value })
    }
    sidebar.renameTreeNode(props.tree, nodeRename.value)
    setNodeName(node, nodeRename.value)
  } catch (err) {
    console.error('重命名失败:', err)
    nodeRename.value = nodeNameOrigin.value
  }

  blurRenameBook()
}

const blurRenameBook = () => {
  setTimeout(() => {
    nodeRename.value = ''
    nodeNameOrigin.value = ''
    inRenameMode.value = false
  }, 100)
}

const onDeleteNode = async (node: TreeNode) => {
  if (isMultiSelected.value && sidebar.isSelected(node.key)) {
    await sidebar.deleteSelectedNodes()
  } else {
    try {
      await sidebar.deleteNode(node.data.id, node.data.guid)
      sidebar.deleteTreeNode(node)
    } catch (err) {
      console.error('删除节点失败:', err)
    }
  }
}

const treeItemRef = useTemplateRef<any>('treeItemRef')

const addNode = async (node: TreeNode) => {
  if (!sidebar.canAddChildren(node)) {
    console.warn('此节点不能添加子节点')
    return
  }

  if (isCreatingChild.value) {
    return
  }

  showCreateChildInput(node, 'note')
}

// ── 拖拽 ──

const isDragging = ref(false)
const isDragOver = ref(false)

const onDragStart = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return

  let dragNodes: { key: string; type: string; parentId: string; label: string }[]

  if (sidebar.isSelected(node.key) && sidebar.selectedKeys.length > 1) {
    const selected = sidebar.getSelectedNodes()
    dragNodes = selected.map(n => ({
      key: n.key,
      type: n.type,
      parentId: n.parentId || '',
      label: n.label,
    }))
  } else {
    sidebar.selectNode(node.key)
    dragNodes = [{
      key: node.key,
      type: node.type,
      parentId: node.parentId || '',
      label: node.label,
    }]
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify(dragNodes))
  sidebar.setDragNodes(dragNodes)

  const dragImage = document.createElement('div')
  dragImage.classList.add('drag-image')
  dragImage.textContent = dragNodes.length > 1
    ? `${dragNodes.length} 个项目`
    : node.label
  dragImage.style.cssText = 'position:absolute;top:-1000px;'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 10, 10)

  isDragging.value = true

  setTimeout(() => {
    if (dragImage.parentNode) {
      document.body.removeChild(dragImage)
    }
  }, 0)
}

const onDragEnd = () => {
  isDragging.value = false
  sidebar.clearDragNodes()
}

const onDragEnter = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return
  if (sidebar.currentDragNodes.length === 0) return
  if (sidebar.currentDragNodes.some(d => d.key === node.key)) return
  if (!sidebar.canAddChildren(node)) return

  const hasInvalidDrag = sidebar.currentDragNodes.some(
    d => d.parentId === node.key || sidebar.isDescendantOf(node.key, d.key),
  )
  if (hasInvalidDrag) return

  event.preventDefault()
  isDragOver.value = true
}

const onDragOver = (event: DragEvent, node: TreeNode) => {
  if (!event.dataTransfer) return
  if (sidebar.currentDragNodes.length === 0) return
  if (sidebar.currentDragNodes.some(d => d.key === node.key)) return
  if (!sidebar.canAddChildren(node)) return

  const hasInvalidDrag = sidebar.currentDragNodes.some(
    d => d.parentId === node.key || sidebar.isDescendantOf(node.key, d.key),
  )
  if (hasInvalidDrag) return

  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = async (event: DragEvent, targetNode: TreeNode) => {
  event.preventDefault()
  isDragOver.value = false

  if (!sidebar.canAddChildren(targetNode)) return
  if (sidebar.currentDragNodes.length === 0) return

  if (sidebar.currentDragNodes.length > 1) {
    await sidebar.moveSelectedNodes(targetNode.data.guid)
    return
  }

  const dragData = sidebar.currentDragNodes[0]
  if (!dragData) return
  if (dragData.key === targetNode.key) return
  if (dragData.parentId == targetNode.key) return
  if (sidebar.isDescendantOf(targetNode.key, dragData.key)) return

  try {
    const draggedNode = findNodeByKey(sidebar.treeLabels, dragData.key)
    if (!draggedNode) return
    if (draggedNode.parentId == targetNode.key) return

    if (draggedNode.type === 'file') {
      await sidebar.moveNode({
        id: draggedNode.data.id,
        parentId: targetNode.data.guid,
      })
      draggedNode.parentId = targetNode.key
      sidebar.moveTreeNode(draggedNode, targetNode.key)
    } else if (draggedNode.type === 'folder') {
      await sidebar.moveFolder(draggedNode.key, targetNode.key)
      await sidebar.loadNodeTree()
    }
  } catch (error) {
    console.error('拖拽处理错误:', error)
  }
}

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

// ── isExpanded 同步 ──

watch(
  () => treeItemRef.value?.isExpanded,
  (expanded) => {
    if (expanded !== undefined) {
      sidebar.setNodeExpanded(props.tree.key, expanded)
    }
  },
)

// ── 创建子节点 ──

const isCreatingChild = ref(false)
const creatingType = ref<'note' | 'folder'>('note')
const creatingName = ref('')
const creatingInputRef = useTemplateRef<HTMLInputElement>('creatingInputRef')
const creatingParentNode = ref<TreeNode | null>(null)
let creatingClickOutsideHandler: ((event: MouseEvent) => void) | null = null

const showCreateChildInput = (
  parentNode: TreeNode,
  type: 'note' | 'folder',
) => {
  if (isCreatingChild.value) {
    cancelCreateChild()
    return
  }

  if (creatingClickOutsideHandler) {
    document.removeEventListener('mousedown', creatingClickOutsideHandler)
    creatingClickOutsideHandler = null
  }

  setTimeout(() => {
    creatingParentNode.value = parentNode
    creatingType.value = type
    creatingName.value = ''
    isCreatingChild.value = true

    if (parentNode.type === 'folder' && treeItemRef.value) {
      if (!treeItemRef.value.isExpanded && treeItemRef.value.handleToggle) {
        treeItemRef.value.handleToggle()
      }
    }

    nextTick(() => {
      setTimeout(() => {
        if (creatingInputRef.value) {
          creatingInputRef.value.focus()

          creatingClickOutsideHandler = (event: MouseEvent) => {
            const inputElement = creatingInputRef.value
            if (inputElement && !inputElement.contains(event.target as Node)) {
              cancelCreateChild()
            }
          }

          setTimeout(() => {
            if (creatingClickOutsideHandler) {
              document.addEventListener('mousedown', creatingClickOutsideHandler)
            }
          }, 100)
        }
      }, 0)
    })
  }, 100)
}

const cancelCreateChild = () => {
  isCreatingChild.value = false
  creatingName.value = ''
  creatingParentNode.value = null

  if (creatingClickOutsideHandler) {
    document.removeEventListener('mousedown', creatingClickOutsideHandler)
    creatingClickOutsideHandler = null
  }
}

const finishCreateChild = async () => {
  const name = creatingName.value.trim()
  if (!name || !creatingParentNode.value) {
    cancelCreateChild()
    return
  }

  try {
    await sidebar.addNodeInTree(
      creatingParentNode.value.data.guid,
      creatingType.value,
      name,
    )
    await sidebar.loadNodeTree()
    cancelCreateChild()
  } catch (error) {
    console.error('创建失败:', error)
    cancelCreateChild()
  }
}

onBeforeUnmount(() => {
  if (creatingClickOutsideHandler) {
    document.removeEventListener('mousedown', creatingClickOutsideHandler)
    creatingClickOutsideHandler = null
  }
})
</script>

<template>
  <TreeItem
    ref="treeItemRef"
    v-slot="{ isExpanded }"
    as-child
    :level="level"
    :value="tree"
  >
    <li>
      <div
        class="group relative my-0.5 flex items-center rounded-lg px-2 py-1.5 outline-none transition-all duration-200 ease-out cursor-pointer select-none"
        :class="{
          'opacity-40': isDragging,
          'ring-2 ring-primary/30 ring-offset-1 ring-offset-background bg-primary/5': isDragOver,
          'bg-primary/10 text-primary': isNodeSelected,
          'hover:bg-muted/60': !isNodeSelected && !isDragOver,
        }"
        :style="{ 'padding-left': `${level * 0.75 + 0.5}rem` }"
        @click="handleClick($event, tree)"
        @contextmenu="handleContextMenu(tree)"
        :draggable="!inRenameMode"
        @dragstart="onDragStart($event, tree)"
        @dragend="onDragEnd"
        @dragenter="onDragEnter($event, tree)"
        @dragover="onDragOver($event, tree)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, tree)"
      >
        <template v-if="tree.type === 'folder'">
          <div
            class="flex items-center justify-center w-5 h-5 rounded-md mr-1.5 transition-all duration-200"
            :class="isExpanded ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted/50 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20'"
          >
            <span
              v-if="!isExpanded"
              class="icon-[lucide--folder] size-3.5 text-amber-600 dark:text-amber-400"
            />
            <span
              v-else
              class="icon-[lucide--folder-open] size-3.5 text-amber-600 dark:text-amber-400"
            />
          </div>
        </template>
        <template v-else>
          <div
            class="flex items-center justify-center w-5 h-5 rounded-md mr-1.5 bg-muted/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-200"
          >
            <span class="icon-[lucide--file-text] size-3.5 text-blue-500 dark:text-blue-400" />
          </div>
        </template>
        <div
          class="group flex flex-1 items-center overflow-hidden"
          :class="{ 'user-select-text': inRenameMode }"
        >
          <input
            v-if="inRenameMode"
            ref="nodeRenameInputRef"
            v-model="nodeRename"
            @keyup.enter="doRenameNode(tree)"
            @blur="blurRenameBook"
            @keydown.stop
            @click.stop
            @mousedown.stop
            class="flex-1 rounded-lg border border-primary/30 bg-background px-2.5 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            style="user-select: text; -webkit-user-select: text; -moz-user-select: text;"
          />
          <template v-else>
            <div class="flex-1 truncate pl-1.5">
              <CustomContextMenu>
                <div class="flex w-full items-center">
                  <span
                    class="truncate text-sm"
                    :class="{ 'font-medium': isNodeSelected }"
                  >
                    {{ tree.label }}
                  </span>
                </div>
                <template #content>
                  <!-- 多选时只显示批量删除 -->
                  <template v-if="isMultiSelected && isNodeSelected">
                    <CustomContextMenuItem @click="onDeleteNode(tree)">
                      <span class="icon-[lucide--trash-2] mr-2 size-4 text-rose-500 dark:text-rose-400" />
                      删除 {{ sidebar.selectedKeys.length }} 个项目
                    </CustomContextMenuItem>
                  </template>
                  <!-- 单选时显示完整菜单 -->
                  <template v-else>
                    <CustomContextMenuItem v-if="tree.type === 'folder'" @click="showCreateChildInput(tree, 'note')">
                      <span class="icon-[lucide--file-plus] mr-2 size-4 text-blue-500 dark:text-blue-400" />
                      新建笔记
                    </CustomContextMenuItem>
                    <CustomContextMenuItem v-if="tree.type === 'folder'" @click="showCreateChildInput(tree, 'folder')">
                      <span class="icon-[lucide--folder-plus] mr-2 size-4 text-amber-600 dark:text-amber-400" />
                      新建笔记本
                    </CustomContextMenuItem>
                    <CustomContextMenuItem @click="renameNode(tree)">
                      <span class="icon-[lucide--pencil] mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
                      重命名
                    </CustomContextMenuItem>
                    <CustomContextMenuItem @click="onDeleteNode(tree)">
                      <span class="icon-[lucide--trash-2] mr-2 size-4 text-rose-500 dark:text-rose-400" />
                      删除
                    </CustomContextMenuItem>
                  </template>
                </template>
              </CustomContextMenu>
            </div>
            <div
              class="flex flex-none items-center opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
              @click.stop
              v-show="!inRenameMode && tree.type === 'folder'"
            >
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                @click.stop="addNode(tree)"
              >
                <span class="icon-[lucide--plus] size-3.5" />
              </Button>
            </div>
          </template>
        </div>
      </div>

      <!-- 创建子项输入框 -->
      <div
        v-if="isCreatingChild && creatingParentNode && creatingParentNode.key === tree.key"
        class="my-1.5 mx-2 animate-fade-in"
        :style="{ 'padding-left': `${(level + 1) * 0.75 + 0.5}rem` }"
        @click.stop
      >
        <input
          ref="creatingInputRef"
          v-model="creatingName"
          :placeholder="creatingType === 'note' ? '输入笔记名称...' : '输入笔记本名称...'"
          class="w-full rounded-lg border border-primary/30 bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300"
          @keyup.enter="finishCreateChild"
          @keyup.esc="cancelCreateChild"
          @click.stop
          @keydown.stop
        />
      </div>

      <!-- 子节点列表 -->
      <ul v-if="isExpanded && tree.children && tree.children.length > 0" class="list-none">
        <Tree :tree-items="tree.children" :level="level + 1" :sorted-trees="sortedTrees" />
      </ul>
    </li>
  </TreeItem>
</template>

<style scoped>
.drag-image {
  padding: 6px 12px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.user-select-text {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
