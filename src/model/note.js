import db from '../plugins/sqlite3/db.js'
import Model from './base.js'

export default class Note extends Model {
  constructor() {
    super()
    this.table = 'note'
  }
  getOne(id) {
    return db.get(`select * from note where id=?`, [id])
  }
  getAllByBook(uid, bid) {
    return db.all(`select * from note where uid=? and bid=?`, [uid, bid])
  }
  getAllByTag(uid, tid) {
    return db.all(
      `select b.* from note_tag as a left join note as b on a.nid=b.id where a.tid=? and b.uid=?`,
      [tid, uid]
    )
  }
  getAll(uid) {
    return db.all(`select * from note where uid=?`, [uid])
  }
  update(id, data) {
    return super.update(id, this.table, data)
  }
  add(data) {
    return super.insert('note', data)
  }
  updateToLocal(uid, data) {}
}
