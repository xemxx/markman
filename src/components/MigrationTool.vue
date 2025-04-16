<template>
  <div v-if="showMigration" class="migration-overlay">
    <div class="migration-dialog">
      <h2>数据结构升级</h2>
      <p>正在将笔记和笔记本合并为统一的数据结构，请稍候...</p>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/plugins/sqlite3/index'

const showMigration = ref(false)
const progress = ref(0)
const statusMessage = ref('准备迁移...')

// 检查是否需要迁移
async function checkMigrationNeeded() {
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

// 执行迁移
async function performMigration() {
  try {
    showMigration.value = true
    progress.value = 10
    statusMessage.value = '正在准备迁移...'
    
    // 获取笔记本和笔记的数量
    const notebookCount = await getTableCount('notebook')
    const noteCount = await getTableCount('note')
    const totalCount = notebookCount + noteCount
    
    if (totalCount === 0) {
      progress.value = 100
      statusMessage.value = '没有数据需要迁移'
      setTimeout(() => {
        showMigration.value = false
      }, 1500)
      return
    }
    
    // 迁移笔记本
    progress.value = 20
    statusMessage.value = `正在迁移笔记本 (0/${notebookCount})...`
    
    await db.exec(`
      INSERT INTO node (uid, guid, parentId, title, content, type, sort, sortType, modifyState, SC, addDate, modifyDate)
      SELECT uid, guid, 'root', name, '', 'folder', sort, sortType, modifyState, SC, addDate, modifyDate
      FROM notebook
      WHERE modifyState < 3
    `)
    
    progress.value = 50
    statusMessage.value = `正在迁移笔记 (0/${noteCount})...`
    
    // 迁移笔记
    await db.exec(`
      INSERT INTO node (uid, guid, parentId, title, content, type, sort, sortType, modifyState, SC, addDate, modifyDate)
      SELECT uid, guid, bid, title, content, 'note', 0, 0, modifyState, SC, addDate, modifyDate
      FROM note
      WHERE modifyState < 3
    `)
    
    progress.value = 90
    statusMessage.value = '验证迁移结果...'
    
    // 验证迁移结果
    const nodeCount = await getTableCount('node')
    if (nodeCount > 0) {
      progress.value = 100
      statusMessage.value = `迁移完成，共迁移 ${nodeCount} 条数据`
      
      // 3秒后关闭迁移对话框
      setTimeout(() => {
        showMigration.value = false
      }, 3000)
    } else {
      progress.value = 100
      statusMessage.value = '迁移失败，请联系开发者'
    }
  } catch (error) {
    console.error('迁移过程中出错:', error)
    progress.value = 100
    statusMessage.value = '迁移过程中出错，请联系开发者'
  }
}

// 获取表中的记录数
async function getTableCount(tableName: string): Promise<number> {
  const result = await db.get<{ count: number }>(
    `SELECT count(*) as count FROM ${tableName}`,
    []
  )
  return result?.count || 0
}

onMounted(async () => {
  const needMigration = await checkMigrationNeeded()
  if (needMigration) {
    await performMigration()
  }
})
</script>

<style scoped>
.migration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.migration-dialog {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.progress-container {
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 15px 0;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

h2 {
  margin-top: 0;
  color: #333;
}

p {
  margin: 10px 0;
  color: #666;
}
</style>
