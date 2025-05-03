<script lang="ts" setup>
import { TreeItem } from 'reka-ui'
import Tree from './tree.vue'
import type { TreeNode } from '@/store/sidebar'
const props = defineProps<{
  tree: TreeNode
  level: number
  selected: boolean
}>()

const emits = defineEmits(['onDeleteNode'])

import { ref, useTemplateRef, nextTick, onMounted, onBeforeUnmount } from 'vue'
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
import CustomContextMenu from './CustomContextMenu.vue'
import CustomContextMenuItem from './CustomContextMenuItem.vue'
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

// 改为使用 any 类型来避免类型检查错误，实际上这是 TreeItem 组件
const treeItemRef = useTemplateRef<any>('treeItemRef')
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

    if (dragData.parentId == targetNode.key) return

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

// 添加创建相关状态变量
const isCreatingChild = ref(false)
const creatingType = ref<'note' | 'folder'>('note')
const creatingName = ref('')
const creatingInputRef = useTemplateRef('creatingInputRef')
const creatingParentNode = ref<TreeNode | null>(null)
// 添加用于处理点击外部的状态
let creatingClickOutsideHandler: ((event: MouseEvent) => void) | null = null

// 显示创建输入框
const showCreateChildInput = (
  parentNode: TreeNode,
  type: 'note' | 'folder',
) => {
  // 移除之前可能存在的处理器
  if (creatingClickOutsideHandler) {
    document.removeEventListener('mousedown', creatingClickOutsideHandler)
    creatingClickOutsideHandler = null
  }

  // 延迟设置状态，确保右键菜单已完全关闭
  setTimeout(() => {
    creatingParentNode.value = parentNode
    creatingType.value = type
    creatingName.value = ''
    isCreatingChild.value = true

    // 确保文件夹是展开的
    if (parentNode.type === 'folder' && !treeItemRef.value?.isExpanded) {
      treeItemRef.value?.handleToggle()
    }

    nextTick(() => {
      // 设置焦点
      setTimeout(() => {
        if (creatingInputRef.value) {
          creatingInputRef.value.focus()

          // 设置点击外部区域关闭输入框的事件监听器
          creatingClickOutsideHandler = (event: MouseEvent) => {
            const inputElement = creatingInputRef.value
            // 如果点击的不是输入框，则关闭输入框
            if (inputElement && !inputElement.contains(event.target as Node)) {
              cancelCreateChild()
            }
          }

          // 延迟添加事件监听器，避免当前点击被捕获
          setTimeout(() => {
            if (creatingClickOutsideHandler) {
              document.addEventListener(
                'mousedown',
                creatingClickOutsideHandler,
              )
            }
          }, 0)
        }
      }, 0)
    })
  }, 50) // 延迟50ms，确保菜单已关闭
}

// 取消创建
const cancelCreateChild = () => {
  isCreatingChild.value = false
  creatingName.value = ''
  creatingParentNode.value = null

  // 移除点击外部区域的事件监听器
  if (creatingClickOutsideHandler) {
    document.removeEventListener('mousedown', creatingClickOutsideHandler)
    creatingClickOutsideHandler = null
  }
}

// 完成创建
const finishCreateChild = async () => {
  if (!creatingName.value.trim() || !creatingParentNode.value) {
    cancelCreateChild()
    return
  }

  try {
    if (creatingType.value === 'folder') {
      // 创建笔记本
      await sidebar.addFolder(creatingName.value.trim())
    } else {
      // 创建笔记
      // 根据父节点类型确定添加位置
      let parentId = 'root'
      if (creatingParentNode.value.type === 'folder') {
        parentId = creatingParentNode.value.data.guid
      } else if (creatingParentNode.value.parentId) {
        parentId = creatingParentNode.value.parentId
      }

      const guid = await sidebar.addNoteInFolder(parentId)
      if (guid) {
        const note = await sidebar.getNodeByGuid(guid)
        if (note) {
          await sidebar.updateNote({
            id: note.id,
            title: creatingName.value.trim(),
          })
        }
      }
    }

    // 重新加载树结构
    await sidebar.loadNodeTree()

    // 重置状态
    cancelCreateChild()
  } catch (error) {
    console.error('创建失败:', error)
    cancelCreateChild()
  }
}

// 修改添加笔记本函数
const addFolder = async (parentNode: TreeNode) => {
  showCreateChildInput(parentNode, 'folder')
}

// 修改添加笔记函数
const addNoteInParent = async (parentNode: TreeNode) => {
  showCreateChildInput(parentNode, 'note')
}

// 在组件卸载时移除事件监听器
onBeforeUnmount(() => {
  // 已有的清理代码...

  // 添加清理创建输入框的点击外部事件监听器
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
    <div
      class="group my-0.5 flex items-center rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted/80 data-[selected]:bg-accent/50 data-[selected]:text-accent-foreground"
      :style="{ 'padding-left': `${level * 1.5 + 0.5}rem` }"
      @click="onNodeSelect(tree)"
      :draggable="!inRenameMode"
      @dragstart="onDragStart($event, tree)"
      @dragend="onDragEnd"
      @dragenter="onDragEnter($event, tree)"
      @dragover="onDragOver($event, tree)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, tree)"
      :class="{
        'opacity-50': isDragging,
        'border-2 border-dashed border-primary bg-muted/80': isDragOver,
      }"
    >
      <template v-if="tree.type === 'folder'">
        <span
          v-if="!isExpanded"
          class="icon-[lucide--folder] size-4 flex-none text-muted-foreground/90 transition-colors group-hover:text-foreground"
        />
        <span
          v-else
          class="icon-[lucide--folder-open] size-4 flex-none text-muted-foreground/90 transition-colors group-hover:text-foreground"
        />
      </template>
      <template v-else>
        <!-- 所有文件节点使用文档图标 -->
        <span
          class="icon-[ion--document-text-outline] size-4 flex-none text-muted-foreground/90 transition-colors group-hover:text-foreground"
        />
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
          class="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @click.stop
          style="
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
          "
        />
        <template v-else>
          <div class="flex-1 truncate pl-2">
            <CustomContextMenu>
              <div class="flex w-full items-center">
                <span class="truncate text-sm font-medium">{{
                  tree.label
                }}</span>
              </div>
              <template #content>
                <!-- 共有菜单项 -->
                <CustomContextMenuItem @click="addNoteInParent(tree)">
                  <span
                    class="icon-[lucide--file-plus] mr-2 size-4 text-muted-foreground"
                  />
                  新建笔记
                </CustomContextMenuItem>
                <CustomContextMenuItem @click="addFolder(tree)">
                  <span
                    class="icon-[lucide--folder-plus] mr-2 size-4 text-muted-foreground"
                  />
                  新建笔记本
                </CustomContextMenuItem>
                <CustomContextMenuItem @click="renameNode(tree)">
                  <span
                    class="icon-[lucide--pencil] mr-2 size-4 text-muted-foreground"
                  />
                  重命名
                </CustomContextMenuItem>
                <!-- 根据节点类型使用不同的删除操作 -->
                <CustomContextMenuItem
                  @click="
                    tree.type === 'folder'
                      ? onDeleteFolder(tree)
                      : onDeleteNote(tree)
                  "
                >
                  <span
                    class="icon-[lucide--trash-2] mr-2 size-4 text-destructive/70"
                  />
                  删除
                </CustomContextMenuItem>
              </template>
            </CustomContextMenu>
          </div>
          <div
            class="grid flex-none grid-cols-1 place-content-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            @click.stop
            v-show="!inRenameMode"
          >
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6 rounded-full hover:bg-primary/10"
              @click="addNode(tree)"
            >
              <span class="icon-[lucide--plus] size-3.5" />
            </Button>
          </div>
        </template>
      </div>
    </div>

    <!-- 创建子项输入框 - 在节点下显示 -->
    <div
      v-if="
        isCreatingChild &&
        creatingParentNode &&
        creatingParentNode.key === tree.key
      "
      class="my-1 px-2"
      :style="{ 'padding-left': `${(level + 1) * 1.5 + 0.5}rem` }"
      @click.stop
    >
      <input
        ref="creatingInputRef"
        v-model="creatingName"
        :placeholder="
          creatingType === 'note' ? '输入笔记名称' : '输入笔记本名称'
        "
        class="w-full flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        @keyup.enter="finishCreateChild"
        @keyup.esc="cancelCreateChild"
        @click.stop
        @keydown.stop
      />
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
  border-radius: 6px;
  color: var(--foreground);
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-select-text {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
}
</style>
