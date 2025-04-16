import { Notebook, notebookItem } from '@/model/notebook.js'
import { noteItem, NoteModel } from '@/model/note'
import { v1 as uuid } from 'uuid'
import { defineStore } from 'pinia'
import { useUserStore, useEditorStore, useSyncStore } from './index'

const model = new Notebook()

const nModel = new NoteModel()

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
  notebooks: notebookItem[]
  type: string
  flagId: string
  tid: string
  treeLabels: TreeNode[]
  selectedKeys: string[]
  rootNotes: noteItem[] // 根目录下的笔记
  rootNoteBookNames: {
    [key: string]: string
  }
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
    notebooks: [],
    type: 'all',
    flagId: '',
    tid: '',
    treeLabels: [],
    selectedKeys: [],
    rootNotes: [],
    rootNoteBookNames: {},
    inSearch: false,
    searchResult: [],
    currentDragNode: null, // 初始化为null
  }),
  actions: {
    async loadNodeTree() {
      const user = useUserStore()
      try {
        // 加载根目录笔记
        this.rootNotes = await nModel.getAllByBook(user.id, 'root')

        // 加载所有笔记本
        this.notebooks = await model.getAll(user.id)

        // 获取所有笔记，用于构建多级嵌套
        const allNotes = await nModel.getAll(user.id)

        // 创建节点映射，用于快速查找
        const nodeMap = new Map<string, TreeNode>()

        // 构建根目录笔记节点
        const rootNoteNodes = this.rootNotes.map(note => {
          const node: TreeNode = {
            label: note.title,
            icon: 'icon-[ion--document-text-outline]',
            data: note,
            key: note.guid,
            type: 'file' as const,
            selected: false,
            parentId: 'root',
            level: 0,
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }
          nodeMap.set(note.guid, node)
          return node
        })

        // 构建笔记本节点
        const notebookNodes = await Promise.all(
          this.notebooks.map(async notebook => {
            const node: TreeNode = {
              label: notebook.name,
              icon: 'icon-[lucide--folder]',
              data: notebook,
              key: notebook.guid,
              type: 'folder',
              selected: false,
              parentId: 'root',
              level: 0,
              isExpanded: false,
              canContainChildren: true,
              children: [],
            }
            nodeMap.set(notebook.guid, node)
            return node
          }),
        )

        // 临时存储所有根节点（直接子节点的父ID是'root'）
        const rootNodes = [...rootNoteNodes, ...notebookNodes]

        // 处理所有非根节点的笔记，构建多级嵌套关系
        allNotes.forEach(note => {
          // 跳过根目录笔记，因为已经处理过
          if (note.bid === 'root' || !note.bid) return

          // 检查这个笔记是否已经被处理过
          if (nodeMap.has(note.guid)) return

          // 创建笔记节点
          const noteNode: TreeNode = {
            label: note.title,
            icon: 'icon-[ion--document-text-outline]',
            data: note,
            key: note.guid,
            type: 'file',
            selected: false,
            parentId: note.bid,
            level: 0, // 临时值，后面会重新计算
            isExpanded: false,
            canContainChildren: true,
            children: [],
          }

          // 将节点添加到映射
          nodeMap.set(note.guid, noteNode)
        })

        // 构建节点层级关系
        for (const [key, node] of nodeMap.entries()) {
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
            rootNodes.push(node)
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
        adjustLevel(rootNodes, 0)

        // 设置最终的树结构
        this.treeLabels = rootNodes
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
      const time = Date.parse(Date()) / 1000
      const note = {
        uid: user.id,
        guid: uuid(),
        bid: parentId, // parentId 可以是文件夹或文件的 guid
        title: '未命名',
        content: '',
        modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
        SC: 0, //新建时该值无用
        addDate: time,
        modifyDate: time,
      }
      try {
        const id = await nModel.add(note)
        const editor = useEditorStore()
        editor.checkoutNote(id)
        return note.guid
      } catch (err) {
        console.error(err)
      }
    },
    async addTreeNode(node: TreeNode, guid: string) {
      const note = await nModel.getByGuid(guid)
      const newNode: TreeNode = {
        label: note.title,
        icon: 'icon-[ion--document-text-outline]',
        data: note,
        key: guid,
        type: 'file',
        selected: true,
        parentId: node.key,
        level: node.level + 1,
        isExpanded: false,
        isNew: true,
        // 默认新创建的笔记节点可以包含子节点
        canContainChildren: true,
      }
      insertNode(this.treeLabels, node, newNode)
      return newNode
    },
    async deleteTreeNode(node: TreeNode) {
      removeNode(this.treeLabels, node)
    },
    async loadNotebooks() {
      const user = useUserStore()
      try {
        const notebooks = await model.getAll(user.id)
        this.notebooks = notebooks
      } catch (err) {
        console.log(err)
      }
    },

    async addFolder(name: any) {
      const user = useUserStore()
      const sync = useSyncStore()
      const time = Date.parse(Date()) / 1000
      try {
        await model.add({
          uid: user.id,
          name: name,
          guid: uuid(),
          modifyState: 1, //0：不需要同步，1：新的东西，2：修改过的东西
          SC: 0, //暂时不用
          sort: 1, //暂时不用
          sortType: 1, //暂时不用
          addDate: time,
          modifyDate: time,
        })
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async deleteFolder(id: any) {
      const sync = useSyncStore()
      let guid = ''
      for (let i = 0; i < this.notebooks.length; i++) {
        if (this.notebooks[i].id == id) {
          guid = this.notebooks[i].guid
        }
      }
      try {
        await model.deleteLocal(id, guid)
        //同步服务器
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async updateFolder({ id, name }) {
      const sync = useSyncStore()
      const folder = await model.get(id)
      if (folder.name == name) {
        return
      }
      const { modifyState } = folder
      if (name != '') {
        await model.update(id, {
          name,
          modifyState: modifyState === 0 ? 2 : modifyState,
        })
        sync.sync()
      }
    },

    async updateNote({ id, title }) {
      const sync = useSyncStore()
      const note = await nModel.get(id)
      if (note.title == title) {
        return
      }
      const { modifyState } = note
      if (title != '') {
        await nModel.update(id, {
          title,
          modifyState: modifyState === 0 ? 2 : modifyState,
        })
        sync.sync()
      }
    },

    async moveNote({ id, bid }) {
      const sync = useSyncStore()
      try {
        await nModel.update(id, { bid, modifyState: 2 })
        sync.sync()
      } catch (err) {
        return console.log(err)
      }
    },

    async deleteNote(id: number) {
      const editor = useEditorStore()
      try {
        const { modifyState } = await nModel.get(id)
        if (modifyState == 1) {
          await nModel.delete(id)
        } else {
          const time = Date.parse(Date()) / 1000
          const data = {
            modifyState: 3,
            modifyDate: time,
          }
          await nModel.update(id, data)
        }
        if (id == editor.currentNote.id) {
          editor.resetDefaultNote()
          editor.isEdit = false
        }
        const sync = useSyncStore()
        sync.sync()
      } catch (err) {
        console.log(err)
      }
    },

    renameTreeNode(node: TreeNode, newName: string) {
      return renameNode(this.treeLabels, node, newName)
    },

    moveTreeNode(node: TreeNode, targetNodeKey: string) {
      // 不能将节点移动到自己下面
      if (node.key === targetNodeKey) return false

      // 不能将节点移动到其子节点下（防止循环引用）
      if (
        targetNodeKey !== 'root' &&
        this.isDescendantOf(node.key, targetNodeKey)
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
    exitSearch() {
      this.inSearch = false
    },
    // 直接在根目录添加笔记
    async addRootNote(): Promise<TreeNode | undefined> {
      const noteGuid = await this.addNoteInFolder('root')
      if (noteGuid) {
        const note = await nModel.getByGuid(noteGuid)
        // 创建新节点
        const newNode: TreeNode = {
          label: note.title,
          icon: 'icon-[ion--document-text-outline]',
          data: note,
          key: noteGuid,
          type: 'file',
          selected: true,
          parentId: 'root',
          level: 0,
          isExpanded: false,
          isNew: true,
        }
        // 直接添加到顶层
        this.treeLabels.unshift(newNode)
        return newNode
      }
      return undefined
    },
    // 移动文件夹的方法
    async moveFolder(folderId: string, targetFolderId: string) {
      // 如果拖拽到根目录，targetFolderId 为 'root'
      // 此处需要根据实际数据库结构实现
      // 这里只实现树结构的变更
      const sync = useSyncStore()
      try {
        // 不能将文件夹移动到自身或其子节点中（防止循环引用）
        if (folderId === targetFolderId) return

        // 检查目标文件夹是否是当前文件夹的子节点（防止循环引用）
        if (targetFolderId !== 'root') {
          const isChildFolder = this.isDescendantOf(folderId, targetFolderId)
          if (isChildFolder) {
            console.error('无法将文件夹移动到其子文件夹中')
            return
          }
        }

        // 这里应该添加实际的数据库操作来移动文件夹
        // 目前的实现仅更新内存中的树结构

        // 找到要移动的文件夹节点
        const folderToMove = this.treeLabels.find(node => node.key === folderId)
        if (folderToMove && folderToMove.type === 'folder') {
          // 更新其父节点ID
          folderToMove.parentId = targetFolderId

          // 如果文件夹已经在树中的顶层，需要先移除它
          const index = this.treeLabels.findIndex(node => node.key === folderId)
          if (index !== -1) {
            this.treeLabels.splice(index, 1)
          }

          // 将文件夹添加到目标节点的子节点中
          if (targetFolderId === 'root') {
            // 移动到根目录，直接添加到顶层
            this.treeLabels.push(folderToMove)
          } else {
            // 移动到另一个文件夹内
            const targetFolder = this.treeLabels.find(
              node => node.key === targetFolderId,
            )
            if (targetFolder) {
              if (!targetFolder.children) {
                targetFolder.children = []
              }
              targetFolder.children.push(folderToMove)
            }
          }

          // 同步到服务器
          sync.sync()
        }
      } catch (err) {
        console.error('移动文件夹失败:', err)
      }
    },
    // 检查nodeId是否是potentialAncestorId的后代节点
    isDescendantOf(potentialAncestorId: string, targetId: string): boolean {
      // 查找潜在祖先节点
      const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (const node of nodes) {
          if (node.key === id) return node
          if (node.children) {
            const found = findNode(node.children, id)
            if (found) return found
          }
        }
        return null
      }

      // 检查目标节点是否在节点的子树中
      const isInSubtree = (node: TreeNode, id: string): boolean => {
        if (!node.children) return false

        for (const child of node.children) {
          if (child.key === id) return true
          if (isInSubtree(child, id)) return true
        }
        return false
      }

      // 先找到潜在的祖先节点
      const ancestorNode = findNode(this.treeLabels, potentialAncestorId)
      if (!ancestorNode) return false

      // 检查目标节点是否在祖先节点的子树中
      return isInSubtree(ancestorNode, targetId)
    },
    // 设置当前拖拽的节点
    setDragNode(node: DragNodeData) {
      this.currentDragNode = node
    },

    // 清除当前拖拽的节点
    clearDragNode() {
      this.currentDragNode = null
    },
  },
})
