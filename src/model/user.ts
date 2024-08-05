import { db } from '../plugins/sqlite3/db'
import { Model } from './base'

export default class User extends Model {
  getActiver() {
    return db.get(`select * from user where state= ?`, [1])
  }

  existUser(username: string, uuid: string) {
    return db
      .get(`select id from user where username = ? and uuid = ?`, [
        username,
        uuid,
      ])
      .then((data: { id: any } | undefined) => {
        if (data != undefined) {
          return data.id
        } else {
          return ''
        }
      })
  }

  getByUserName(username: string) {
    return db
      .get(
        `select id,uuid from user where username = ? order by lastSC desc limit 1`,
        [username],
      )
      .then((data: { id: any; uuid: string } | undefined) => {
        return data
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
