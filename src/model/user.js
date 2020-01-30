import db from '../plugins/sqlite3/db.js'
import Model from './base.js'

export default class User extends Model {
  getActiver() {
    return db.get(`select * from user where state= ?`, [1])
  }

  existUser(username, server) {
    return db
      .get(`select id from user where username = ? and server =?`, [
        username,
        server
      ])
      .then(data => {
        if (data != undefined) {
          return data.id
        } else {
          return ''
        }
      })
  }

  createUser(username, server, token) {
    return db.run(
      `insert into user(username,server,token,state)values(?,?,?,?)`,
      [username, server, token, 1]
    )
  }

  update(id, data) {
    return super.update(id, 'user', data)
  }

  getLastSC(uid) {
    return db.get(`select lastSC from user where id= ?`, [uid])
  }

  updateLastSC(id, lastSC) {
    return this.update(id, { lastSC })
  }
}
