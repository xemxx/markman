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
  notes: noteItem[]
  tid: string
  treeLabels: TreeNode[]
  inSearch: boolean
  searchResult: TreeNode[]
}
const state: State = {
  notebooks: [],
  type: 'all',
  flagId: '',
  notes: [],
  tid: '',
  treeLabels: [],
  inSearch: false,
  searchResult: [],
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
  state: () => state,
  actions: {
    update_notebooks(value: notebookItem[]) {
      this.notebooks = value
    },
    update_notes({ type, flagId, notes }) {
      this.type = type ? type : this.type
      this.flagId = flagId ? flagId : this.tid
      this.notes = notes ? notes : this.notes
    },
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
        editor.loadNote(id)
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
        this.update_notebooks(notebooks)
      } catch (err) {
        console.log(err)
      }
    },

    async addNotebook(name: any) {
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

    async deleteNotebook(id: any) {
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

    updateNotebook({ id, name }) {
      const sync = useSyncStore()
      let finded = this.notebooks.find(item => id === item.id)
      if (finded == undefined) {
        return
      }
      const { modifyState } = finded
      if (name != '') {
        return model
          .update(id, {
            name,
            modifyState: modifyState === 0 ? 2 : modifyState,
          })
          .then(() => {
            sync.sync()
          })
          .catch((err: any) => console.log(err))
      }
    },

    //更新state中的list，视图将自动更新
    async loadNotes({ type = '', flagId = '' } = {}) {
      const user = useUserStore()
      const uid = user.id
      let list: Promise<{}>
      if (type == undefined || type == '') {
        type = this.type
      }
      if (flagId == undefined || flagId == '') {
        flagId = this.flagId
      }
      if (type == 'note') {
        list = nModel.getAllByBook(uid, flagId)
      } else if (type == 'tag') {
        list = nModel.getAllByTag(uid, flagId)
      } else if (type == 'all') {
        list = nModel.getAll(uid)
        flagId = '0'
      } else {
        return Promise.reject(new Error('flagID and type is not define'))
      }

      const notes = await list
      this.update_notes({
        type,
        flagId,
        notes: notes,
      })
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

    renameTreeNode(node: TreeNode, newName: string) {
      const renamed = renameNode(this.treeLabels, node, newName)
      // console.log(this.treeLabels)
      // if (renamed) {
      //   this.treeLabels = [...this.treeLabels] // 触发 Vue 的响应式系统
      // }
      return renamed
    },

    async moveTreeNode(node: TreeNode, targetNodeKey: string) {
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

    async searchNotes(search: string) {
      const user = useUserStore()
      let list: noteItem[] = []
      if (this.type == 'note') {
        list = await nModel.searchContentInBook(user.id, this.flagId, search)
      } else if (this.type == 'tag') {
        list = nModel.searchContentInTag(user.id, this.flagId, search)
      } else if (this.type == 'all') {
        list = await nModel.searchContentInAll(user.id, search)
      }
      this.update_notes({
        type: this.type,
        flagId: this.flagId,
        notes: list,
      })
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
      this.searchResult = searchNodes(state.treeLabels, searchStr)
    },
    exitSearch() {
      this.inSearch = false
    },
  },
})
