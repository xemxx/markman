<template>
  <div class="flex h-11 items-center justify-between px-3">
    <div class="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 rounded-lg hover:bg-primary/10 transition-all duration-200"
        :class="{ 'animate-spin': isSyncing }"
        @click="doSync"
      >
        <span
          class="icon-[lucide--refresh-cw] size-4"
          :class="sync.online ? 'text-primary' : 'text-muted-foreground'"
        />
      </Button>
      <span class="text-xs font-medium" :class="sync.online ? 'text-primary/80' : 'text-muted-foreground'">
        {{ sync.online ? (isSyncing ? '同步中...' : '已同步') : '离线' }}
      </span>
    </div>
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
      @click="quit"
    >
      <span class="icon-[lucide--log-out] size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useSyncStore, useUserStore, useSidebarStore } from '@/store'
import { useRouter } from '@/router'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'

const sync = useSyncStore()
const { isSyncing } = storeToRefs(sync)
const sidebar = useSidebarStore()
const doSync = async () => {
  await sync.sync()
  sidebar.loadNodeTree()
}

const user = useUserStore()
const router = useRouter()

const quit = () => {
  user.unSetCurrentUser().then(() => {
    router.push('/login').catch(err => err)
  })
}
</script>

<style scoped>
.toolbar {
  height: 36px;
  align-items: center;
  padding: 2px 5px;
}
.toolbar p {
  text-align: center;
  flex: 1;
}
</style>
