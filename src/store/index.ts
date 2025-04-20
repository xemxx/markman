// store.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出 store
export * from './editor'
export * from './user'
// export * from './sync' // 旧版同步逻辑
export * from './sync-optimized' // 优化后的同步逻辑
export * from './sidebar'
export * from './preference'
export * from './listen'
