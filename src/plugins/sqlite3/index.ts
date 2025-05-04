import path from 'path'
import Sqlite from './sqlite'
import sql from './sql'
import { ipcRenderer } from 'electron'
// 导入package.json中的版本信息
import pkg from '../../../package.json'

// 当前应用版本
const currentVersion = pkg.version

let dbPath = path.join(
  await ipcRenderer.invoke('m::app-get-path', 'userData'),
  'data.db',
)

export const db = Sqlite.getInstance(dbPath)

// 存储版本信息的表名
const VERSION_TABLE = 'app_version'

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
    [tableName],
  )
  return result?.count > 0
}

// 检查表中是否有数据
async function tableHasData(tableName: string): Promise<boolean> {
  const result = await db.get<{ count: number }>(
    `SELECT count(*) as count FROM ${tableName}`,
    [],
  )
  return result?.count > 0
}

// 获取数据库中存储的应用版本
async function getStoredVersion(): Promise<string | null> {
  try {
    // 检查版本表是否存在
    const versionTableExists = await tableExists(VERSION_TABLE)
    if (!versionTableExists) {
      // 创建版本表
      await db.exec(`
        CREATE TABLE IF NOT EXISTS ${VERSION_TABLE} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT NOT NULL,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      return null
    }

    // 获取最新版本记录
    const result = await db.get<{ version: string }>(
      `SELECT version FROM ${VERSION_TABLE} ORDER BY id DESC LIMIT 1`,
      [],
    )
    return result?.version || null
  } catch (error) {
    console.error('获取存储版本时出错:', error)
    return null
  }
}

// 更新存储的版本信息
async function updateStoredVersion(version: string): Promise<void> {
  try {
    await db.exec(
      `
      INSERT INTO ${VERSION_TABLE} (version) VALUES ("${version}")
    `,
    )
    console.log(`版本信息已更新为 ${version}`)
  } catch (error) {
    console.error('更新版本信息时出错:', error)
  }
}

// 检查是否需要迁移数据
async function checkMigrationNeeded(): Promise<boolean> {
  try {
    // 检查node表是否存在
    const nodeTableExists = await tableExists('node')
    if (!nodeTableExists) {
      return false // 表不存在，不需要迁移
    }

    // 检查node表是否有数据
    const nodeHasData = await tableHasData('node')
    if (nodeHasData) {
      return false // 表已有数据，不需要迁移
    }

    // 检查旧表是否有数据
    const notebookHasData = await tableHasData('notebook')
    const noteHasData = await tableHasData('note')

    return notebookHasData || noteHasData // 如果旧表有数据，需要迁移
  } catch (error) {
    console.error('检查迁移状态时出错:', error)
    return false
  }
}

// 比较版本号
function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split('.').map(Number)
  const v2Parts = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0
    const v2Part = v2Parts[i] || 0

    if (v1Part > v2Part) return 1
    if (v1Part < v2Part) return -1
  }

  return 0
}

// 导入迁移服务
import {
  showMigrationProgress,
  updateMigrationProgress,
  completeMigration,
} from '@/services/migrationService'

export const initDB = async function () {
  // 执行基本SQL初始化
  for (const row of sql) {
    await db.exec(row)
  }

  // 没有意义，因为这个客户端可以接入多个服务端，只要本地版本到了，就一定要升级
  // 检查服务端版本是否兼容
  // const serverVersionCompatible = await checkServerVersion()
  // if (!serverVersionCompatible) {
  //   console.log('服务端版本不兼容，退出升级')
  //   return
  // }

  // 获取存储的版本
  const storedVersion = await getStoredVersion()
  console.log(
    `当前应用版本: ${currentVersion}, 数据库版本: ${storedVersion || '未设置'}`,
  )

  // 如果没有存储版本，说明是新安装或旧版本，设置当前版本并执行所有迁移
  if (!storedVersion) {
    // 执行所有版本的迁移
    await migrateAll()
    // 更新版本信息
    await updateStoredVersion(currentVersion)
    return
  }

  // 如果存储版本低于当前版本，执行增量迁移
  if (compareVersions(storedVersion, currentVersion) < 0) {
    await migrateIncremental(storedVersion, currentVersion)
    // 更新版本信息
    await updateStoredVersion(currentVersion)
  }
}

// 使用上面导入的MigrationTool组件方法

// 执行所有迁移
async function migrateAll() {
  console.log('执行所有迁移...')

  // 显示迁移进度对话框
  showMigrationProgress({
    title: '数据升级',
    description: '正在执行数据库升级，请勿关闭应用...',
    progress: 0,
    statusMessage: '准备升级...',
  })

  try {
    // 0.3.0 之前版本升级 - 添加uuid字段
    updateMigrationProgress(20, '正在升级用户数据...')
    await migrateBelow030()

    // 0.3.1 版本升级 - 数据结构统一
    updateMigrationProgress(50, '正在统一数据结构...')
    await migrateTo031()

    // 完成迁移
    completeMigration(true, '数据升级完成')
  } catch (error) {
    console.error('迁移过程中出错:', error)
    completeMigration(false, '数据升级失败，请联系开发者')
  }
}

// 执行增量迁移
async function migrateIncremental(fromVersion: string, toVersion: string) {
  console.log(`执行从 ${fromVersion} 到 ${toVersion} 的增量迁移...`)

  // 显示迁移进度对话框
  showMigrationProgress({
    title: '数据升级',
    description: `正在从版本 ${fromVersion} 升级到 ${toVersion}，请勿关闭应用...`,
    progress: 0,
    statusMessage: '准备升级...',
  })

  try {
    let progress = 0

    // 0.3.0 之前版本升级
    if (compareVersions(fromVersion, '0.3.0') < 0) {
      updateMigrationProgress(20, '正在升级用户数据...')
      await migrateBelow030()
      progress = 50
    }

    // 0.3.0 到 0.3.1 版本升级
    if (
      compareVersions(fromVersion, '0.3.1') < 0 &&
      compareVersions(toVersion, '0.3.1') >= 0
    ) {
      updateMigrationProgress(progress + 20, '正在统一数据结构...')
      await migrateTo031()
      progress = 90
    }

    // 未来可以在这里添加更多版本的迁移

    // 完成迁移
    completeMigration(true, '数据升级完成')
  } catch (error) {
    console.error('迁移过程中出错:', error)
    completeMigration(false, '数据升级失败，请联系开发者')
  }
}

// 0.3.0 之前版本升级
async function migrateBelow030() {
  console.log('执行 0.3.0 之前版本升级...')

  // 检查user表是否存在uuid字段
  const fields =
    (await db.all<tableStruct>('PRAGMA table_info(user)', {})) || undefined
  let have = false
  if (!fields || fields.length === 0) {
    return
  }

  for (const field of fields) {
    if (field.name === 'uuid') {
      have = true
      break
    }
  }

  if (!have) {
    console.log('添加uuid字段并清理无用账户...')
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

// 0.3.1 版本升级 - 数据结构统一
async function migrateTo031() {
  console.log('执行 0.3.1 版本升级 - 数据结构统一...')

  // 检查是否需要迁移
  const needMigration = await checkMigrationNeeded()
  if (!needMigration) {
    console.log('不需要执行数据结构统一迁移')
    return
  }

  console.log('开始执行数据结构统一迁移...')

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

  console.log('数据结构统一迁移完成')
}
