import mitt from 'mitt'

// 定义应用中所有事件的类型
export type MigrationEvents = {
  'migration:show': {
    show?: boolean
    title?: string
    description?: string
    progress?: number
    statusMessage?: string
    showProgress?: boolean
  }
  'migration:update-progress': { percent: number; message: string }
  'migration:complete': { success: boolean; message?: string }
  'migration:show-confirm': any
}

// 定义可能的所有事件类型
export type AppEvents = MigrationEvents & {
  'query-close-note': any
  // 可以添加更多应用中的事件类型
}

// 创建并导出类型安全的emitter
export const emitter = mitt<AppEvents>()
