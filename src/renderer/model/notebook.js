import db from '../plugins/sqlite3/db.js'
import Model from './base.js'
//import Note from './note.js'
//const nModel = new Note()
export default class Notebook extends Model {
  getAll(uid) {
    return db.all(`select * from notebook where uid=? and modifyState<3`, [uid])
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

  deleteLocal(id) {
    return this.update(id, { modifyState: 3 }).then(() => {
      return db.exec(`update note set modifyState=3 where bid=${id}`)
    })
  }

  getLocalByServer(uid, serverData) {
    let sql = ``
    let guids = serverData.map(row => {
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

  getModify(uid) {
    return db.all(`select * from notebook where uid=? and modifyState>0`, [uid])
  }
}
