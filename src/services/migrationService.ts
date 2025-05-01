/**
 * 迁移服务 - 处理版本检查和数据迁移
 */

import { syncApi } from '@/api/syncApi'
import { ipcRenderer } from 'electron'
import { emitter } from '@/lib/emitter'

// 当前客户端版本
const currentVersion = '0.3.1' // 硬编码版本号，实际应用中可以从package.json中获取

// 事件名称
export const MIGRATION_EVENTS = {
  SHOW_MIGRATION: 'migration:show',
  UPDATE_PROGRESS: 'migration:update-progress',
  COMPLETE_MIGRATION: 'migration:complete',
  SHOW_CONFIRM: 'migration:show-confirm',
}

/**
 * 检查服务端版本
 * @returns 服务端版本是否兼容
 */
export async function checkServerVersion(server: string): Promise<boolean> {
  try {
    if (!server) {
      return true // 没有服务器地址，不需要检查
    }

    // 获取服务器版本
    try {
      const versionInfo = await syncApi.getServerVersion(server)

      // 检查最低客户端版本要求
      if (versionInfo.minClientVersion) {
        const compareResult = compareVersions(
          currentVersion,
          versionInfo.minClientVersion,
        )

        if (compareResult < 0) {
          // 客户端版本低于服务端要求的最低版本
          return false
        }
      }

      return true
    } catch (error) {
      console.error('获取服务端版本失败:', error)

      // 服务端可能是旧版本，没有版本API
      // 为了兼容性，我们允许继续使用
      return true
    }
  } catch (error) {
    console.error('检查服务端版本时出错:', error)
    return true
  }
}

/**
 * 显示迁移进度
 * @param options 选项
 */
export function showMigrationProgress(
  options: {
    title?: string
    description?: string
    progress?: number
    statusMessage?: string
    showProgress?: boolean
  } = {},
) {
  emitter.emit(MIGRATION_EVENTS.SHOW_MIGRATION, options)
}

/**
 * 更新迁移进度
 * @param percent 进度百分比
 * @param message 状态消息
 */
export function updateMigrationProgress(percent: number, message: string) {
  emitter.emit(MIGRATION_EVENTS.UPDATE_PROGRESS, { percent, message })
}

/**
 * 完成迁移
 * @param success 是否成功
 * @param message 消息
 */
export function completeMigration(success: boolean = true, message?: string) {
  emitter.emit(MIGRATION_EVENTS.COMPLETE_MIGRATION, { success, message })
}

/**
 * 比较版本号
 * @param v1 版本1
 * @param v2 版本2
 * @returns 比较结果：1(v1>v2), 0(v1=v2), -1(v1<v2)
 */
export function compareVersions(v1: string, v2: string): number {
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
