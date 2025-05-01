import { NodeModel, NodeItem } from '@/model/node'
import { v1 as uuid } from 'uuid'
import { defineStore } from 'pinia'
import { useUserStore, useEditorStore, useSyncStore } from './index'

const nodeModel = new NodeModel()

export interface TreeNode {
  icon: string
  key: string
  label: string
  children?: TreeNode[]
  data: any
  type: 'folder' | 'file' // 保持兼容，仍用 'folder' 表示笔记本，'file' 表示笔记
  selected: boolean
  parentId?: string // 父节点ID
  level: number // 层级深度
  isExpanded?: boolean
  isNew?: boolean
  // 所有节点默认都可以包含子节点
  canContainChildren?: boolean // 默认为 true，所有节点都可以包含子节点
}

// 拖拽节点数据结构
export interface DragNodeData {
  key: string
  type: string
  parentId: string
  label: string
}

interface State {
  nodes: NodeItem[]
  type: string
  flagId: string
  tid: string
  treeLabels: TreeNode[]
  selectedKeys: string[]
  rootNodes: NodeItem[] // 根目录下的节点
  inSearch: boolean
  searchResult: TreeNode[]
  currentDragNode: DragNodeData | null // 当前拖拽中的节点
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
      // 检查节点是否可以包含子节点
      // 如果是文件夹类型，默认可以包含子节点
      // 如果是文件类型，则检查 canContainChildren 标志
      const canAddChild =
        currentNode.type === 'folder' || currentNode.canContainChildren === true

      if (canAddChild) {
        if (!currentNode.children) {
          currentNode.children = []
        }
        // 设置新节点的父节点ID和层级
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

export const useSidebarStore = defineStore('sidebar', {
  state: (): State => ({
    nodes: [],
    type: 'all',
    flagId: '',
    tid: '',
    treeLabels: [],
    selectedKeys: [],
    rootNodes: [],
    inSearch: false,
    searchResult: [],
    currentDragNode: null, // 初始化为null
  }),
  actions: {
    async loadNodeTree() {
      const user = useUserStore()
      try {
        if (!user.isLogin) {
          console.error('User isNotLogin')
          return
        }
        // 加载所有节点
        this.nodes = await nodeModel.getAll(user.dbUser?.id!)

        // 加载根目录节点
        this.rootNodes = await nodeModel.getChildren(user.dbUser?.id!, 'root')

        // 创建节点映射，用于快速查找
        const nodeMap = new Map<string, TreeNode>()

        // 构建根目录节点
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
            selected: false,
            parentId: 'root',
            level: 0,
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }
          nodeMap.set(node.guid, treeNode)
          return treeNode
        })

        // 处理所有非根节点，构建多级嵌套关系
        this.nodes.forEach(node => {
          // 跳过根目录节点，因为已经处理过
          if (node.parentId === 'root' || !node.parentId) return

          // 检查这个节点是否已经被处理过
          if (nodeMap.has(node.guid)) return

          // 创建树节点
          const treeNode: TreeNode = {
            label: node.title,
            icon:
              node.type === 'folder'
                ? 'icon-[lucide--folder]'
                : 'icon-[ion--document-text-outline]',
            data: node,
            key: node.guid,
            type: node.type === 'folder' ? 'folder' : 'file',
            selected: false,
            parentId: node.parentId,
            level: 0, // 临时值，后面会重新计算
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }

          // 将节点添加到映射
          nodeMap.set(node.guid, treeNode)
        })

        // 构建节点层级关系
        for (const [, node] of nodeMap.entries()) {
          // 跳过无父节点ID或父节点ID为root的节点
          if (!node.parentId || node.parentId === 'root') continue

          // 查找父节点，这里确保 parentId 非空
          const parentNode = nodeMap.get(node.parentId)
          if (parentNode) {
            // 确保父节点有children数组
            if (!parentNode.children) {
              parentNode.children = []
            }

            // 将节点添加到父节点的children
            parentNode.children.push(node)
          } else {
            // 如果没有找到父节点，将其作为根节点
            node.parentId = 'root'
            rootTreeNodes.push(node)
          }
        }

        // 调整节点层级
        const adjustLevel = (nodes: TreeNode[], level: number) => {
          nodes.forEach(node => {
            node.level = level
            if (node.children && node.children.length > 0) {
              adjustLevel(node.children, level + 1)
            }
          })
        }

        // 调整所有根节点的层级
        adjustLevel(rootTreeNodes, 0)

        // 设置最终的树结构
        this.treeLabels = rootTreeNodes
      } catch (err) {
        console.error('加载节点树时出错:', err)
      }
    },

    // 判断节点是否可以包含子节点
    canAddChildren(node: TreeNode): boolean {
      // 如果明确设置为不能包含子节点，则返回false
      if (node.canContainChildren === false) return false

      // 文件夹类型可以包含子节点
      if (node.type === 'folder') return true

      // 默认所有节点都可以包含子节点
      return true
    },

    // 在给定节点下创建新笔记
    async addNoteInFolder(parentId: string): Promise<string | undefined> {
      const user = useUserStore()
      if (user.dbUser?.id! === null) {
        console.error('User ID is null')
        return
      }
      const time = Date.parse(Date()) / 1000
      const note = {
        uid: user.dbUser?.id!,
        guid: uuid(),
        parentId: parentId, // 父节点的guid
        title: '未命名',
        content: '',
        type: 'note' as 'note',
        sort: 0,
        sortType: 0,
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: 0, //新建时该值无用
        addDate: time,
        modifyDate: time,
      }
      try {
        const id = await nodeModel.add(note)
        const editor = useEditorStore()
        editor.checkoutNote(id)
        return note.guid
      } catch (err) {
        console.error(err)
      }
    },

    // 添加新的根目录笔记
    async addRootNote() {
      return this.addNoteInFolder('root')
    },

    // 添加树节点
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
        selected: true,
        parentId: node.key,
        level: node.level + 1,
        isExpanded: false,
        isNew: true,
        // 默认新创建的节点可以包含子节点
        canContainChildren: true,
      }
      insertNode(this.treeLabels, node, newNode)
      return newNode
    },

    // 删除树节点
    async deleteTreeNode(node: TreeNode) {
      removeNode(this.treeLabels, node)
    },

    // 添加文件夹
    async addFolder(name: string) {
      const user = useUserStore()
      if (user.dbUser?.id! === null) {
        console.error('User ID is null')
        return
      }
      const sync = useSyncStore()
      const time = Date.parse(Date()) / 1000
      try {
        await nodeModel.add({
          uid: user.dbUser?.id!,
          guid: uuid(),
          parentId: 'root',
          title: name,
          content: '',
          type: 'folder' as 'folder',
          sort: 1,
          sortType: 1,
          modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
          SC: 0, //暂时不用
          addDate: time,
          modifyDate: time,
        })
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    // 删除文件夹
    async deleteFolder(id: any) {
      const sync = useSyncStore()
      try {
        const node = await nodeModel.get(id)
        await nodeModel.deleteLocal(id, node.guid)
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    // 更新文件夹
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

    // 更新笔记
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

    // 移动笔记
    async moveNote({ id, parentId }: { id: number; parentId: string }) {
      try {
        await nodeModel.update(id, { parentId, modifyState: 2 })
      } catch (err) {
        return console.log(err)
      }
    },

    // 删除笔记
    async deleteNote(id: number) {
      const editor = useEditorStore()
      try {
        const { modifyState } = await nodeModel.get(id)
        if (modifyState === 1) {
          await nodeModel.delete(id)
        } else {
          const time = Date.parse(Date()) / 1000
          const data = {
            modifyState: 3,
            modifyDate: time,
          }
          await nodeModel.update(id, data)
        }
        if (id === editor.currentNote.id) {
          editor.resetDefaultNote()
          editor.isEdit = false
        }
        const sync = useSyncStore()
        sync.sync()
      } catch (err) {
        console.log(err)
      }
    },

    // 重命名树节点
    renameTreeNode(node: TreeNode, newName: string) {
      return renameNode(this.treeLabels, node, newName)
    },

    // 移动树节点
    moveTreeNode(node: TreeNode, targetNodeKey: string) {
      // 不能将节点移动到自己下面
      if (node.key === targetNodeKey) return false

      // 不能将节点移动到其子节点下（防止循环引用）
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

    // 检查是否是子节点
    isDescendantOf(nodeKey: string, potentialAncestorKey: string): boolean {
      // 如果节点键相同，返回 false（不是子节点关系）
      if (nodeKey === potentialAncestorKey) {
        return false
      }

      // 递归检查节点及其子节点
      const isDescendant = (nodes: TreeNode[], targetKey: string): boolean => {
        for (const node of nodes) {
          // 如果当前节点就是要检查的节点，返回 true
          if (node.key === targetKey) {
            return true
          }
          // 如果有子节点，递归检查
          if (node.children && node.children.length > 0) {
            if (isDescendant(node.children, targetKey)) {
              return true
            }
          }
        }
        return false
      }

      // 在树中查找指定节点
      const findNode = (nodes: TreeNode[], key: string): TreeNode | null => {
        for (const node of nodes) {
          if (node.key === key) {
            return node
          }
          if (node.children) {
            const found = findNode(node.children, key)
            if (found) {
              return found
            }
          }
        }
        return null
      }

      // 找到潜在的祖先节点
      const ancestorNode = findNode(this.treeLabels, potentialAncestorKey)
      if (!ancestorNode) {
        return false
      }

      // 如果要检查的节点就是祖先节点本身，返回 false
      if (ancestorNode.key === nodeKey) {
        return false
      }

      // 检查节点是否在祖先节点的子节点中
      if (ancestorNode.children && ancestorNode.children.length > 0) {
        return isDescendant(ancestorNode.children, nodeKey)
      }

      return false
    },

    // 搜索树节点
    searchTreeNodes(searchStr: string) {
      if (searchStr === '') {
        return
      }
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

    // 退出搜索
    exitSearch() {
      this.inSearch = false
    },

    // 设置拖拽节点
    setDragNode(node: DragNodeData | null) {
      this.currentDragNode = node
    },

    // 清除拖拽节点
    clearDragNode() {
      this.currentDragNode = null
    },

    // 移动文件夹
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

    // 处理拖拽到根目录
    async handleDropToRoot() {
      if (!this.currentDragNode) return false

      const { key } = this.currentDragNode
      const node = await nodeModel.getByGuid(key)

      if (!node) return false

      // 更新节点的父ID为root
      await nodeModel.update(node.id, {
        parentId: 'root',
        modifyState: node.modifyState === 0 ? 2 : node.modifyState,
      })

      // 刷新树
      await this.loadNodeTree()

      // 同步到服务器
      const sync = useSyncStore()
      sync.sync()

      return true
    },

    // 处理节点拖拽
    async handleNodeDrop(sourceKey: string, targetKey: string) {
      if (sourceKey === targetKey) return false

      const sourceNode = await nodeModel.getByGuid(sourceKey)
      const targetNode = await nodeModel.getByGuid(targetKey)

      if (!sourceNode || !targetNode) return false

      // 更新节点的父ID
      await nodeModel.update(sourceNode.id, {
        parentId: targetNode.guid,
        modifyState: sourceNode.modifyState === 0 ? 2 : sourceNode.modifyState,
      })

      // 刷新树
      await this.loadNodeTree()

      // 同步到服务器
      const sync = useSyncStore()
      sync.sync()

      return true
    },
  },
})
