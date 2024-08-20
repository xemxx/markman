import { db } from '../plugins/sqlite3/index'
import { Model } from './base'

export interface userItem {
  id: any
  token: any
  server: any
  username: any
  lastSC: any
  uuid: string
}

export class User extends Model {
  getActiver() {
    return db.get<userItem>(`select * from user where state= ?`, [1])
  }

  async existUser(username: string, uuid: string) {
    const data = await db.get<userItem>(
      `select id from user where username = ? and uuid = ?`,
      [username, uuid],
    )
    if (data != undefined) {
      return data.id
    } else {
      return ''
    }
  }

  async getByUserName(username: string) {
    const data = await db.get<userItem>(
      `select id,uuid from user where username = ? order by lastSC desc limit 1`,
      [username],
    )
    return data
  }

  add(data: { [x: string]: any }) {
    return super.insert('user', data)
  }

  update(id: string, data: { [x: string]: any }) {
    return super.update(id, 'user', data)
  }

  getLastSC(uid: any) {
    return db.get<userItem>(`select lastSC from user where id= ?`, [uid])
  }
}
