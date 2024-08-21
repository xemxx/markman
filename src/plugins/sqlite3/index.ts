import path from 'path'
import { app } from '@electron/remote'
import Sqlite from './sqlite'
import sql from './sql'
import { userItem } from '../../model/user'

let dbPath = path.join(app.getPath('userData'), 'data.db')

export const db = Sqlite.getInstance(dbPath)

interface tableStruct {
  cid: number
  name: string
  type: string
  notnull: string
  dflt_value: any
  pk: number
}

export const initDB = async function () {
  for (const row of sql) {
    await db.exec(row)
  }

  // 0.3.0 之前版本升级
  const fileds =
    (await db.all<tableStruct>('PRAGMA table_info(user)', {})) || undefined
  let have = false
  if (!fileds || fileds.length === 0) {
    return
  }
  for (const filed of fileds) {
    if (filed.name === 'uuid') {
      have = true
      break
    }
  }
  if (!have) {
    // 新增uuid
    await db.exec(`ALTER TABLE user ADD COLUMN uuid TEXT;`)
    // 删除无用账户
    await db.exec(`DELETE FROM user
WHERE id NOT IN (
select id from (SELECT max(lastSC),id,username
FROM user
GROUP BY username)
)`)
  }
}
