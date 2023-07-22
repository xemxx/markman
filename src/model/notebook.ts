import { db } from '../plugins/sqlite3/db'
import { Model } from './base.js'

export interface notebookItem {
  id: number
  uid: number
  guid: string
  name: string
  sort: number //--目录排序--
  sortType: number // --文章排序--
  modifyState: number // -- 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据 --
  SC: number
  addDate: number
  modifyDate: number
  // TODO: 转换到两层结构，解构使用和定义的结构体
  rename: boolean
}

export class Notebook extends Model {
  getAll(uid: any) {
    return db.all(`select * from notebook where uid=? and modifyState<3`, [uid])
  }
  add(data: { [x: string]: any }) {
    return super.insert('notebook', data)
  }
  update(id: string, data: { [x: string]: any }) {
    return super.update(id, 'notebook', data)
  }
  delete(id: string) {
    return super.delete(id, 'notebook')
  }

  deleteLocal(id: any, guid: any) {
    return this.update(id, { modifyState: 3 })
      .then(() => {
        return db.run(`update note set modifyState=? where bid=?`, [3, guid])
      })
      .catch((err: any) => console.log(err))
  }

  getLocalByServer(uid: any, serverData: any[]) {
    let sql = ``
    let guids = serverData.map((row: { guid: any }) => {
      sql += `?,`
      return row.guid
    })
    guids.push(uid)
    return db.all(
      `select * from notebook where guid in (${sql.substr(
        0,
        sql.length - 1,
      )}) and uid = ?`,
      guids,
    )
  }

  getModify(uid: any) {
    return db.all(`select * from notebook where uid=? and modifyState>0`, [uid])
  }
}
