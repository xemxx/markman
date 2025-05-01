<template>
  <div v-if="showMigration" class="migration-overlay">
    <div class="migration-dialog">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
      <p>{{ statusMessage }}</p>
      <div v-if="showButtons" class="button-container">
        <button v-if="showCancelButton" @click="onCancel" class="cancel-button">
          取消
        </button>
        <button
          v-if="showConfirmButton"
          @click="onConfirm"
          class="confirm-button"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { emitter } from '@/lib/emitter'
import { MIGRATION_EVENTS } from '@/services/migrationService'
import { useSidebarStore } from '@/store'

// UI状态
const showMigration = ref(false)
const progress = ref(0)
const statusMessage = ref('准备迁移...')
const title = ref('数据结构升级')
const description = ref('正在将笔记和笔记本合并为统一的数据结构，请稍候...')
const showProgress = ref(true)
const showButtons = ref(false)
const showCancelButton = ref(false)
const showConfirmButton = ref(false)
const confirmButtonText = ref('确定')
const sidebarS = useSidebarStore()

// 回调函数
let onConfirmCallback: (() => void) | null = null
let onCancelCallback: (() => void) | null = null

// 按钮事件处理
function onConfirm() {
  if (onConfirmCallback) {
    onConfirmCallback()
  }
}

function onCancel() {
  if (onCancelCallback) {
    onCancelCallback()
  }
}

// 监听事件
onMounted(() => {
  // 显示迁移进度
  emitter.on(MIGRATION_EVENTS.SHOW_MIGRATION, (options: any = {}) => {
    const {
      show = true,
      title: newTitle,
      description: newDescription,
      progress: newProgress,
      statusMessage: newStatusMessage,
      showProgress: newShowProgress,
    } = options

    showMigration.value = show

    if (newTitle) title.value = newTitle
    if (newDescription) description.value = newDescription
    if (newProgress !== undefined) progress.value = newProgress
    if (newStatusMessage) statusMessage.value = newStatusMessage
    if (newShowProgress !== undefined) showProgress.value = newShowProgress

    // 默认不显示按钮
    showButtons.value = false
    showCancelButton.value = false
    showConfirmButton.value = false
  })

  // 更新迁移进度
  emitter.on(
    MIGRATION_EVENTS.UPDATE_PROGRESS,
    ({ percent, message }: { percent: number; message: string }) => {
      progress.value = percent
      statusMessage.value = message
    },
  )

  // 完成迁移
  emitter.on(
    MIGRATION_EVENTS.COMPLETE_MIGRATION,
    ({ success, message }: { success: boolean; message?: string }) => {
      progress.value = 100
      statusMessage.value =
        message || (success ? '迁移完成' : '迁移失败，请联系开发者')

      // 3秒后关闭迁移对话框
      setTimeout(() => {
        showMigration.value = false
      }, 3000)

      sidebarS.loadNodeTree()
    },
  )
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

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.confirm-button {
  background-color: #1890ff;
  color: white;
}

.confirm-button:hover {
  background-color: #40a9ff;
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
