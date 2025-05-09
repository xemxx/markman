import { db } from '../plugins/sqlite3/index'
import { Model } from './base'

export interface userItem {
  id: number
  token: string
  server: string
  username: string
  lastSC: number
  uuid: string
}

export class User extends Model {
  getCurrentUser() {
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
      return 0
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

  update(id: number, data: { [x: string]: any }) {
    return super.update(id, 'user', data)
  }

  getLastSC(uid: any) {
    return db.get<userItem>(`select lastSC from user where id= ?`, [uid])
  }
}
