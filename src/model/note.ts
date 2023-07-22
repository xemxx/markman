import { db } from '../plugins/sqlite3/db'
import { Model } from './base'

export interface noteItem {
  id: number
  guid: string
  bid: string // 文件夹guid，和服务端一致
  uid: number
  title: string
  content: string
  modifyState: number // 0：不需要同步，1：新的东西，2：修改过的东西 3：本地删除但是未同步的数据
  SC: number
  addDate: number
  modifyDate: number
}

export class NoteModel extends Model {
  get(id: any) {
    return db.get(`select * from note where id=?`, [id])
  }
  getAllByBook(uid, bid) {
    return db.all(
      `select * from note where uid=? and bid=? and modifyState<3 order by modifyDate desc`,
      [uid, bid],
    )
  }
  getAllByTag(uid, tid) {
    return db.all(
      `select b.* from note_tag as a left join note as b on a.nid=b.id where a.tid=? and b.uid=? and modifyState<3 order by modifyDate desc`,
      [tid, uid],
    )
  }
  getAll(uid) {
    return db.all(
      `select * from note where uid=? and modifyState<3 order by modifyDate desc`,
      [uid],
    )
  }
  update(id, data) {
    return super.update(id, 'note', data)
  }
  add(data) {
    return super.insert('note', data)
  }
  delete(id) {
    return super.delete(id, 'note')
  }
  getLocalByServer(uid, serverData) {
    let sql = ``
    let guids = serverData.map(row => {
      sql += `?,`
      return row.guid
    })
    guids.push(uid)
    return db.all(
      `select * from note where guid in (${sql.substr(
        0,
        sql.length - 1,
      )}) and uid = ?`,
      guids,
    )
  }

  getModify(uid) {
    return db.all(`select * from note where uid=? and modifyState>0`, [uid])
  }
}
