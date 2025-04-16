import { db } from '../plugins/sqlite3/index'
import { Model } from './base'

export interface NodeItem {
  id: number
  uid: number
  guid: string
  parentId: string // 父节点的guid，根节点为'root'
  title: string // 对应note的title和notebook的name
  content: string // 笔记内容，笔记本为空
  type: 'note' | 'folder' // 节点类型
  sort: number // 排序
  sortType: number // 排序类型
  modifyState: number // 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据
  SC: number
  addDate: number
  modifyDate: number
}

export class NodeModel extends Model {
  get(id: any): Promise<NodeItem> {
    return db.get<NodeItem>(`SELECT * FROM node WHERE id=?`, [
      id,
    ]) as Promise<NodeItem>
  }

  getByGuid(guid: string): Promise<NodeItem> {
    return db.get<NodeItem>(`SELECT * FROM node WHERE guid=?`, [
      guid,
    ]) as Promise<NodeItem>
  }

  // 获取所有节点
  getAll(uid: string | number | null) {
    if (uid === null) {
      throw new Error('uid cannot be null')
    }
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND modifyState<3 ORDER BY modifyDate DESC`,
      [uid],
    )
  }

  // 获取指定父节点下的所有子节点
  getChildren(uid: string | number | null, parentId: string) {
    if (uid === null) {
      throw new Error('uid cannot be null')
    }
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND parentId=? AND modifyState<3 ORDER BY modifyDate DESC`,
      [uid, parentId],
    )
  }

  // 获取所有笔记
  getAllNotes(uid: number) {
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND type='note' AND modifyState<3 ORDER BY modifyDate DESC`,
      [uid],
    )
  }

  // 获取所有文件夹
  getAllFolders(uid: number) {
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND type='folder' AND modifyState<3 ORDER BY modifyDate DESC`,
      [uid],
    )
  }

  // 更新节点
  update(id: any, data: { [x: string]: any }) {
    return super.update(id, 'node', data)
  }

  // 添加节点
  add(data: { [x: string]: any }) {
    return super.insert('node', data)
  }

  // 删除节点
  delete(id: any) {
    return super.delete(id, 'node')
  }

  // 标记节点为本地删除
  async deleteLocal(id: any, guid: any) {
    try {
      // 标记当前节点为删除状态
      await this.update(id, { modifyState: 3 })
      // 标记所有子节点为删除状态
      return await db.run(`UPDATE node SET modifyState=? WHERE parentId=?`, [
        3,
        guid,
      ])
    } catch (err) {
      return console.log(err)
    }
  }

  // 获取需要同步的节点
  getModify(uid: string | number | null) {
    if (uid === null) {
      throw new Error('uid cannot be null')
    }
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND modifyState>0`,
      [uid],
    )
  }

  // 根据服务器数据获取本地节点
  getLocalByServer(uid: string | number | null, serverData: any[]) {
    if (uid === null) {
      throw new Error('uid cannot be null')
    }
    let sql = ``
    let guids = serverData.map(row => {
      sql += `?,`
      return row.guid
    })
    guids.push(uid)
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE guid IN (${sql.substring(
        0,
        sql.length - 1,
      )}) AND uid=?`,
      guids,
    )
  }

  // 搜索节点
  searchInFolder(uid: number, parentId: string, search: string) {
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND parentId=? AND (content LIKE ? OR title LIKE ?) ORDER BY modifyDate DESC`,
      [uid, parentId, `%${search}%`, `%${search}%`],
    )
  }

  searchAll(uid: number, search: string) {
    return db.all<NodeItem>(
      `SELECT * FROM node WHERE uid=? AND (content LIKE ? OR title LIKE ?) ORDER BY modifyDate DESC`,
      [uid, `%${search}%`, `%${search}%`],
    )
  }
}
