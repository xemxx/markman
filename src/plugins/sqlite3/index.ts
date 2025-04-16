import path from 'path'
import Sqlite from './sqlite'
import sql from './sql'

import { ipcRenderer } from 'electron'

let dbPath = path.join(
  await ipcRenderer.invoke('m::app-get-path', 'userData'),
  'data.db',
)

export const db = Sqlite.getInstance(dbPath)

interface tableStruct {
  cid: number
  name: string
  type: string
  notnull: string
  dflt_value: any
  pk: number
}

// 检查表是否存在
async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.get<{ count: number }>(
    `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
    [tableName]
  )
  return result?.count > 0
}

// 检查表中是否有数据
async function tableHasData(tableName: string): Promise<boolean> {
  const result = await db.get<{ count: number }>(
    `SELECT count(*) as count FROM ${tableName}`,
    []
  )
  return result?.count > 0
}

// 迁移数据到新的node表
async function migrateToNodeTable() {
  console.log('开始迁移数据到统一的node表...')

  // 检查node表是否已有数据，如果有则不进行迁移
  const nodeHasData = await tableHasData('node')
  if (nodeHasData) {
    console.log('node表已有数据，跳过迁移')
    return
  }

  // 迁移notebook数据
  console.log('迁移notebook数据...')
  await db.exec(`
    INSERT INTO node (uid, guid, parentId, title, content, type, sort, sortType, modifyState, SC, addDate, modifyDate)
    SELECT uid, guid, 'root', name, '', 'folder', sort, sortType, modifyState, SC, addDate, modifyDate
    FROM notebook
    WHERE modifyState < 3
  `)

  // 迁移note数据
  console.log('迁移note数据...')
  await db.exec(`
    INSERT INTO node (uid, guid, parentId, title, content, type, sort, sortType, modifyState, SC, addDate, modifyDate)
    SELECT uid, guid, bid, title, content, 'note', 0, 0, modifyState, SC, addDate, modifyDate
    FROM note
    WHERE modifyState < 3
  `)

  console.log('数据迁移完成')
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

  // 检查是否需要迁移数据到新的node表
  const nodeTableExists = await tableExists('node')
  if (nodeTableExists) {
    // 执行数据迁移
    await migrateToNodeTable()
  }
}
