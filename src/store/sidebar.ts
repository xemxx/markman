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
  type: string
  selected: boolean
}

interface State {
  notebooks: notebookItem[]
  type: string
  flagId: string
  tid: string
  treeLabels: TreeNode[]
  inSearch: boolean
  searchResult: TreeNode[]
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
      if (!currentNode.children) {
        currentNode.children = []
      }
      currentNode.children.push(newNode)
      return true
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
  state: () =>
    <State>{
      notebooks: [],
      type: 'all',
      flagId: '',
      tid: '',
      treeLabels: [],
      inSearch: false,
      searchResult: [],
    },
  actions: {
    async loadNodeTree() {
      const user = useUserStore()
      try {
        this.notebooks = await model.getAll(user.id)

        const noteTree = await Promise.all(
          this.notebooks.map(async item => {
            const notes = await nModel.getAllByBook(user.id, item.guid)
            return {
              book: item,
              notes: notes,
            }
          }),
        )
        this.treeLabels = noteTree.map(item => {
          const i = <TreeNode>{
            label: item.book.name,
            icon: 'icon-[ion--folder-outline]',
            data: item.book,
            key: item.book.guid,
            type: 'folder',
            selected: false,
          }
          if (item.notes && item.notes.length > 0) {
            i.children = item.notes.map(child => {
              return {
                label: child.title,
                icon: 'icon-[ion--document-text-outline]',
                data: child,
                key: child.guid,
                type: 'file',
                selected: false,
              }
            })
          }
          return i
        })
      } catch (err) {
        console.log(err)
      }
    },
    async addNoteInFolder(folderId: string): Promise<string | undefined> {
      const user = useUserStore()
      const time = Date.parse(Date()) / 1000
      const note = {
        uid: user.id,
        guid: uuid(),
        bid: folderId,
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

      insertNode(this.treeLabels, node, <TreeNode>{
        label: note.title,
        icon: 'icon-[ion--document-text-outline]',
        data: note,
        key: guid,
        type: 'file',
        selected: true,
      })
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
  },
})
