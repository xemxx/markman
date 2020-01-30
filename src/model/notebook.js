import db from '../plugins/sqlite3/db.js'
import Model from './base.js'
import uuid from 'uuid'

export default class Notebook extends Model {
  getAll(uid) {
    return db.all(`select * from notebook where uid=?`, [uid])
  }
  add(data) {
    return super.insert('notebook', data)
  }
  update(id, data) {
    return super.update(id, 'notebook', data)
  }
  delete(id) {
    return super.delete(id, 'notebook')
  }

  getLocalByServer(uid, serverData) {
    let sql = ``
    const guids = serverData.Map(row => {
      sql += `?,`
      return row.guid
    })
    guids.push(uid)
    return db.all(
      `select * from notebook where guid in (${sql.substr(
        0,
        sql.length - 1
      )}) and uid = ?`,
      guids
    )
  }
}
