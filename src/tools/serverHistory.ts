/**
 * 服务器历史记录管理工具
 */

const STORAGE_KEY = 'server_history'
const MAX_HISTORY = 10 // 最多保存10条历史记录

/**
 * 获取服务器历史记录
 * @returns 服务器地址历史记录数组
 */
export function getServerHistory(): string[] {
  const history = localStorage.getItem(STORAGE_KEY)
  return history ? JSON.parse(history) : []
}

/**
 * 添加服务器地址到历史记录
 * @param server 服务器地址
 */
export function addServerToHistory(server: string): void {
  if (!server) return
  
  let history = getServerHistory()
  
  // 如果已存在，先移除旧的记录
  history = history.filter(item => item !== server)
  
  // 添加到历史记录开头
  history.unshift(server)
  
  // 限制历史记录数量
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY)
  }
  
  // 保存到本地存储
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/**
 * 从历史记录中移除服务器地址
 * @param server 要移除的服务器地址
 */
export function removeServerFromHistory(server: string): void {
  if (!server) return
  
  let history = getServerHistory()
  history = history.filter(item => item !== server)
  
  // 保存到本地存储
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/**
 * 清空服务器历史记录
 */
export function clearServerHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
