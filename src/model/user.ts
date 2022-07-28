import { db } from '../plugins/sqlite3/db'
import { Model } from './base'

export default class User extends Model {
  getActiver() {
    return db.get(`select * from user where state= ?`, [1])
  }

  existUser(username: string, server: string) {
    return db
      .get(`select id from user where username = ? and server =?`, [
        username,
        server,
      ])
      .then((data: { id: any } | undefined) => {
        if (data != undefined) {
          return data.id
        } else {
          return ''
        }
      })
  }

  add(data: { [x: string]: any }) {
    return super.insert('user', data)
  }

  update(id: string, data: { [x: string]: any }) {
    return super.update(id, 'user', data)
  }

  getLastSC(uid: any) {
    return db.get(`select lastSC from user where id= ?`, [uid])
  }
}
