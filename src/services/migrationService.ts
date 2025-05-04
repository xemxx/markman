/**
 * 迁移服务 - 处理版本检查和数据迁移
 */

import { emitter } from '@/lib/emitter'

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
  emitter.emit('migration:show', options)
}

/**
 * 更新迁移进度
 * @param percent 进度百分比
 * @param message 状态消息
 */
export function updateMigrationProgress(percent: number, message: string) {
  emitter.emit('migration:update-progress', { percent, message })
}

/**
 * 完成迁移
 * @param success 是否成功
 * @param message 消息
 */
export function completeMigration(success: boolean = true, message?: string) {
  emitter.emit('migration:complete', { success, message })
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
