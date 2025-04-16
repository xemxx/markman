// store.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出 store
export * from './editor'
export * from './user'
export * from './sync'
export * from './sidebar'
export * from './preference'
export * from './listen'
