import { NodeModel, NodeItem } from '@/model/node'
import { v1 as uuid } from 'uuid'
import { defineStore } from 'pinia'
import { useUserStore, useEditorStore, useSyncStore } from './index'
import type { SortConfig } from '@/components/sidebar/types'

const nodeModel = new NodeModel()

export interface TreeNode {
  icon: string
  key: string
  label: string
  children?: TreeNode[]
  data: any
  type: 'folder' | 'file'
  selected: boolean
  parentId?: string
  level: number
  isExpanded?: boolean
  isNew?: boolean
  canContainChildren?: boolean
}

export interface DragNodeData {
  key: string
  type: string
  parentId: string
  label: string
}

interface State {
  nodes: NodeItem[]
  treeLabels: TreeNode[]
  selectedKeys: string[]
  lastClickedKey: string | null
  rootNodes: NodeItem[]
  inSearch: boolean
  searchResult: TreeNode[]
  currentDragNodes: DragNodeData[]
  sortConfig: SortConfig
}

const removeNode = (nodes: TreeNode[], targetNode: TreeNode): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key === targetNode.key) {
      nodes.splice(i, 1)
      return true
    }
    if (node.children) {
      const removed = removeNode(node.children, targetNode)
      if (removed) {
        return true
      }
    }
  }
  return false
}

const renameNode = (
  nodes: TreeNode[],
  targetNode: TreeNode,
  newName: string,
): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key === targetNode.key) {
      node.label = newName
      return true
    }
    if (node.children) {
      const renamed = renameNode(node.children, targetNode, newName)
      if (renamed) {
        return true
      }
    }
  }
  return false
}

const insertNode = (
  nodes: TreeNode[],
  targetNode: TreeNode,
  newNode: TreeNode,
): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i]
    if (currentNode.key === targetNode.key) {
      const canAddChild =
        currentNode.type === 'folder' || currentNode.canContainChildren === true

      if (canAddChild) {
        if (!currentNode.children) {
          currentNode.children = []
        }
        newNode.parentId = currentNode.key
        newNode.level = currentNode.level + 1

        currentNode.children.push(newNode)
        return true
      }
      return false
    }
    if (currentNode.children) {
      const inserted = insertNode(currentNode.children, targetNode, newNode)
      if (inserted) {
        return true
      }
    }
  }
  return false
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

export const useSidebarStore = defineStore('sidebar', {
  state: (): State => ({
    nodes: [],
    treeLabels: [],
    selectedKeys: [],
    lastClickedKey: null,
    rootNodes: [],
    inSearch: false,
    searchResult: [],
    currentDragNodes: [],
    sortConfig: {
      mode: 'name',
      direction: 'asc',
    },
  }),
  actions: {
    // ── 选中管理 ──

    isSelected(key: string): boolean {
      return this.selectedKeys.includes(key)
    },

    selectNode(key: string) {
      this.selectedKeys = [key]
      this.lastClickedKey = key
      this._syncSelectedToTree()
    },

    toggleSelectNode(key: string) {
      const idx = this.selectedKeys.indexOf(key)
      if (idx >= 0) {
        this.selectedKeys.splice(idx, 1)
      } else {
        this.selectedKeys.push(key)
      }
      this.lastClickedKey = key
      this._syncSelectedToTree()
    },

    selectRange(key: string, visibleTrees: TreeNode[]) {
      if (!this.lastClickedKey) {
        this.selectNode(key)
        return
      }
      const flat = this.flattenVisibleTree(visibleTrees)
      const startIdx = flat.indexOf(this.lastClickedKey)
      const endIdx = flat.indexOf(key)
      if (startIdx === -1 || endIdx === -1) {
        this.selectNode(key)
        return
      }
      const lo = Math.min(startIdx, endIdx)
      const hi = Math.max(startIdx, endIdx)
      this.selectedKeys = flat.slice(lo, hi + 1)
      this._syncSelectedToTree()
    },

    clearSelection() {
      this.selectedKeys = []
      this.lastClickedKey = null
      this._syncSelectedToTree()
    },

    _syncSelectedToTree() {
      const selectedSet = new Set(this.selectedKeys)
      const walk = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          node.selected = selectedSet.has(node.key)
          if (node.children) walk(node.children)
        }
      }
      walk(this.treeLabels)
    },

    getSelectedNodes(): TreeNode[] {
      const results: TreeNode[] = []
      const walk = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (this.selectedKeys.includes(node.key)) results.push(node)
          if (node.children) walk(node.children)
        }
      }
      walk(this.treeLabels)
      return results
    },

    // ── 树扁平化（按可视顺序） ──

    flattenVisibleTree(trees: TreeNode[]): string[] {
      const result: string[] = []
      const walk = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          result.push(node.key)
          if (node.isExpanded && node.children && node.children.length > 0) {
            walk(node.children)
          }
        }
      }
      walk(trees)
      return result
    },

    setNodeExpanded(key: string, expanded: boolean) {
      const node = findNodeByKey(this.treeLabels, key)
      if (node) {
        node.isExpanded = expanded
      }
    },

    // ── 批量操作 ──

    async deleteSelectedNodes() {
      const nodes = this.getSelectedNodes()
      if (nodes.length === 0) return
      const sync = useSyncStore()
      for (const node of nodes) {
        try {
          await nodeModel.deleteLocal(node.data.id, node.data.guid)
          removeNode(this.treeLabels, node)
        } catch (err) {
          console.error('批量删除节点失败:', err)
        }
      }
      this.selectedKeys = []
      this.lastClickedKey = null
      sync.sync()
    },

    async moveSelectedNodes(targetKey: string) {
      const nodes = this.getSelectedNodes()
      if (nodes.length === 0) return
      const selectedKeySet = new Set(nodes.map(node => node.key))
      const shouldMoveNode = (node: TreeNode): boolean => {
        let parentKey = node.parentId
        while (parentKey && parentKey !== 'root') {
          if (selectedKeySet.has(parentKey)) return false
          const parentNode = findNodeByKey(this.treeLabels, parentKey)
          if (!parentNode) break
          parentKey = parentNode.parentId
        }
        return true
      }
      const rootSelectedNodes = nodes.filter(shouldMoveNode)

      for (const node of rootSelectedNodes) {
        if (node.key === targetKey) continue
        if (targetKey !== 'root' && this.isDescendantOf(targetKey, node.key)) continue
        try {
          await nodeModel.update(node.data.id, { parentId: targetKey, modifyState: 2 })
        } catch (err) {
          console.error('批量移动节点失败:', err)
        }
      }
      await this.loadNodeTree()
      const sync = useSyncStore()
      sync.sync()
    },

    // ── 拖拽 ──

    setDragNodes(nodes: DragNodeData[]) {
      this.currentDragNodes = nodes
    },

    clearDragNodes() {
      this.currentDragNodes = []
    },

    // ── 节点树加载 ──

    async loadNodeTree() {
      const user = useUserStore()
      try {
        if (!user.isLogin) {
          console.error('User isNotLogin')
          return
        }
        this.nodes = await nodeModel.getAll(user.dbUser?.id!)
        this.rootNodes = await nodeModel.getChildren(user.dbUser?.id!, 'root')

        const nodeMap = new Map<string, TreeNode>()

        const rootTreeNodes = this.rootNodes.map(node => {
          const treeNode: TreeNode = {
            label: node.title,
            icon:
              node.type === 'folder'
                ? 'icon-[lucide--folder]'
                : 'icon-[ion--document-text-outline]',
            data: node,
            key: node.guid,
            type: node.type === 'folder' ? 'folder' : 'file',
            selected: this.selectedKeys.includes(node.guid),
            parentId: 'root',
            level: 0,
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }
          nodeMap.set(node.guid, treeNode)
          return treeNode
        })

        this.nodes.forEach(node => {
          if (node.parentId === 'root' || !node.parentId) return
          if (nodeMap.has(node.guid)) return

          const treeNode: TreeNode = {
            label: node.title,
            icon:
              node.type === 'folder'
                ? 'icon-[lucide--folder]'
                : 'icon-[ion--document-text-outline]',
            data: node,
            key: node.guid,
            type: node.type === 'folder' ? 'folder' : 'file',
            selected: this.selectedKeys.includes(node.guid),
            parentId: node.parentId,
            level: 0,
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }

          nodeMap.set(node.guid, treeNode)
        })

        for (const [, node] of nodeMap.entries()) {
          if (!node.parentId || node.parentId === 'root') continue
          const parentNode = nodeMap.get(node.parentId)
          if (parentNode) {
            if (!parentNode.children) {
              parentNode.children = []
            }
            parentNode.children.push(node)
          } else {
            node.parentId = 'root'
            rootTreeNodes.push(node)
          }
        }

        const adjustLevel = (nodes: TreeNode[], level: number) => {
          nodes.forEach(node => {
            node.level = level
            if (node.children && node.children.length > 0) {
              adjustLevel(node.children, level + 1)
            }
          })
        }

        adjustLevel(rootTreeNodes, 0)
        this.treeLabels = rootTreeNodes
      } catch (err) {
        console.error('加载节点树时出错:', err)
      }
    },

    canAddChildren(node: TreeNode): boolean {
      return node.type === 'folder'
    },

    async addNodeInTree(
      parentId: string,
      type: 'folder' | 'note',
      title: string,
    ): Promise<string | undefined> {
      const user = useUserStore()
      if (user.dbUser?.id! === null) {
        console.error('User ID is null')
        return
      }
      const time = Date.parse(Date()) / 1000
      const note = {
        uid: user.dbUser?.id!,
        guid: uuid(),
        parentId: parentId,
        title: title,
        content: '',
        type: type,
        sort: 0,
        sortType: 0,
        modifyState: 1,
        SC: 0,
        addDate: time,
        modifyDate: time,
      }
      try {
        const id = await nodeModel.add(note)
        if (type == 'note') {
          const editor = useEditorStore()
          editor.checkoutNote(id)
        }
        const sync = useSyncStore()
        sync.sync()
        return note.guid
      } catch (err) {
        console.error(err)
      }
    },

    async getNodeByGuid(guid: string) {
      try {
        return await nodeModel.getByGuid(guid)
      } catch (err) {
        console.error('获取节点失败:', err)
        return null
      }
    },

    async addTreeNode(node: TreeNode, guid: string) {
      const nodeData = await nodeModel.getByGuid(guid)
      const newNode: TreeNode = {
        label: nodeData.title,
        icon:
          nodeData.type === 'folder'
            ? 'icon-[lucide--folder]'
            : 'icon-[ion--document-text-outline]',
        data: nodeData,
        key: guid,
        type: nodeData.type === 'folder' ? 'folder' : 'file',
        selected: false,
        parentId: node.key,
        level: node.level + 1,
        isExpanded: false,
        isNew: true,
        canContainChildren: true,
      }
      insertNode(this.treeLabels, node, newNode)
      return newNode
    },

    async deleteTreeNode(node: TreeNode) {
      removeNode(this.treeLabels, node)
    },

    async deleteNode(id: any, guid: any) {
      const sync = useSyncStore()
      try {
        await nodeModel.deleteLocal(id, guid)
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async updateFolder({ id, name }: { id: number; name: string }) {
      const sync = useSyncStore()
      const folder = await nodeModel.get(id)
      if (folder.title === name) {
        return
      }
      const { modifyState } = folder
      if (name !== '') {
        await nodeModel.update(id, {
          title: name,
          modifyState: modifyState === 0 ? 2 : modifyState,
        })
        sync.sync()
      }
    },

    async updateNote({ id, title }: { id: number; title: string }) {
      const sync = useSyncStore()
      const note = await nodeModel.get(id)
      if (note.title === title) {
        return
      }
      const { modifyState } = note
      if (title !== '') {
        await nodeModel.update(id, {
          title,
          modifyState: modifyState === 0 ? 2 : modifyState,
        })
        sync.sync()
      }
    },

    async moveNode({ id, parentId }: { id: number; parentId: string }) {
      try {
        await nodeModel.update(id, { parentId, modifyState: 2 })
      } catch (err) {
        return console.log(err)
      }
    },

    renameTreeNode(node: TreeNode, newName: string) {
      return renameNode(this.treeLabels, node, newName)
    },

    moveTreeNode(node: TreeNode, targetNodeKey: string) {
      if (node.key === targetNodeKey) return false
      if (
        targetNodeKey !== 'root' &&
        this.isDescendantOf(targetNodeKey, node.key)
      ) {
        console.error('无法将节点移动到其子节点下')
        return false
      }

      const nodeToMove = removeNode(this.treeLabels, node)
      if (nodeToMove) {
        return insertNode(
          this.treeLabels,
          <TreeNode>{ key: targetNodeKey },
          node,
        )
      }
      return false
    },

    isDescendantOf(nodeKey: string, potentialAncestorKey: string): boolean {
      if (nodeKey === potentialAncestorKey) return false

      const ancestorNode = findNodeByKey(this.treeLabels, potentialAncestorKey)
      if (!ancestorNode) return false
      if (ancestorNode.key === nodeKey) return false

      const isDescendant = (nodes: TreeNode[], targetKey: string): boolean => {
        for (const node of nodes) {
          if (node.key === targetKey) return true
          if (node.children && node.children.length > 0) {
            if (isDescendant(node.children, targetKey)) return true
          }
        }
        return false
      }

      if (ancestorNode.children && ancestorNode.children.length > 0) {
        return isDescendant(ancestorNode.children, nodeKey)
      }
      return false
    },

    searchTreeNodes(searchStr: string) {
      if (searchStr === '') return
      this.inSearch = true
      const searchNodes = (
        nodes: TreeNode[],
        searchStr: string,
      ): TreeNode[] => {
        return nodes
          .map(node => {
            const children = node.children
              ? searchNodes(node.children, searchStr)
              : []
            if (
              node.label.includes(searchStr) ||
              node.data.content?.includes(searchStr) ||
              children.length > 0
            ) {
              return {
                ...node,
                children: children.length > 0 ? children : undefined,
              }
            }
            return null
          })
          .filter(node => node !== null) as TreeNode[]
      }
      this.searchResult = searchNodes(this.treeLabels, searchStr)
    },

    exitSearch() {
      this.inSearch = false
    },

    async moveFolder(id: string, targetId: string) {
      const node = await nodeModel.getByGuid(id)
      if (!node) return false
      const sync = useSyncStore()
      try {
        await nodeModel.update(node.id, {
          parentId: targetId,
          modifyState: node.modifyState === 0 ? 2 : node.modifyState,
        })
        sync.sync()
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },

    updateSortConfig(config: Partial<SortConfig>) {
      this.sortConfig = { ...this.sortConfig, ...config }
    },

    getSortedTreeData(trees: TreeNode[]): TreeNode[] {
      if (!trees || trees.length === 0) return trees

      const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
        return [...nodes]
          .sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1
            if (a.type === 'file' && b.type === 'folder') return 1

            let comparison = 0
            switch (this.sortConfig.mode) {
              case 'name':
                comparison = a.label.localeCompare(b.label)
                break
              case 'date':
                comparison = (a.data?.modifyDate || 0) - (b.data?.modifyDate || 0)
                break
              default:
                comparison = a.label.localeCompare(b.label)
                break
            }

            return this.sortConfig.direction === 'asc'
              ? comparison
              : -comparison
          })
          .map(node => ({
            ...node,
            children: node.children ? sortNodes(node.children) : undefined,
          }))
      }

      return sortNodes(trees)
    },
  },
})
