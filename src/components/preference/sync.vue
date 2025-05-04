<template>
  <div class="pref-sync mt-5">
    <Bool v-model="autoSync">自动同步</Bool>
    <Input v-model="syncInterval" after="ms" @change="handleIntervalChange">
      同步间隔，单位毫秒
    </Input>
    <div class="mt-4 flex items-center space-x-2">
      <button
        class="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        @click="syncNow"
        :disabled="isSyncing"
      >
        <span v-if="isSyncing" class="mr-2 h-4 w-4 animate-spin">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-loader-2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
        <span v-else class="mr-2 h-4 w-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-refresh-cw"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </span>
        立即同步
      </button>
      <p v-if="lastSyncTime" class="text-sm text-muted-foreground">
        上次同步: {{ formatLastSyncTime(lastSyncTime) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import Input from './common/input.vue'
import Bool from './common/bool.vue'
import { usePreferenceStore, useSyncStore } from '@/store'
import { storeToRefs } from 'pinia'

// 获取 store
const preferenceStore = usePreferenceStore()
const syncStore = useSyncStore()

// 从 preference store 获取响应式状态
const { autoSync, syncInterval } = storeToRefs(preferenceStore)

// 从 sync store 获取状态
const isSyncing = computed(() => syncStore.isSyncing)
const lastSyncTime = computed(() => syncStore.lastSyncTime)

// // 监听自动同步设置变化
// watch(autoSync, newValue => {
//   if (newValue) {
//     syncStore.initAutoSync()
//   } else {
//     syncStore.stopAutoSync()
//   }
// })

// 处理同步间隔变化
function handleIntervalChange() {
  syncStore.updateSyncInterval(syncInterval.value)
}

// 立即同步
function syncNow() {
  syncStore.sync()
}

// 格式化上次同步时间
function formatLastSyncTime(timestamp: number): string {
  if (!timestamp) return '从未同步'

  const now = Date.now()
  const diff = now - timestamp

  if (diff < 1000) {
    return '刚刚'
  } else if (diff < 60000) {
    return `${Math.floor(diff / 1000)}秒前`
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}

// 组件挂载时，确保同步设置正确
onMounted(() => {
  // 如果用户开启了自动同步，确保定时器已启动
  if (autoSync.value && !syncStore.syncTimer) {
    syncStore.initAutoSync()
  }
})
</script>

<style scoped></style>
