import type { TreeNode } from '@/store/sidebar'

export interface SortConfig {
  mode: 'name' | 'date'
  direction: 'asc' | 'desc'
}

// 重新导出TreeNode类型以保持兼容性
export type { TreeNode }
