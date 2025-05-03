<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { ipcRenderer } from 'electron'

const router = useRouter()
const user = useUserStore()

const username = computed(() => user.dbUser?.username || '用户')

const openSettings = () => {
  // 通过IPC发送消息给主进程打开设置窗口
  ipcRenderer.send('app-create-settings-window')
}

const quit = () => {
  user.unSetCurrentUser().then(() => {
    router.push('/login').catch(err => console.log(err))
  })
}
</script>

<template>
  <div class="flex items-center justify-between">
    <DropdownMenu>
      <DropdownMenuTrigger
        class="flex items-center space-x-2 outline-none focus-visible:ring-0"
      >
        <div
          class="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted/50"
        >
          <span
            class="icon-[lucide--square-user-round] size-5 text-primary/80"
          ></span>
        </div>
        <span class="text-sm font-medium">{{ username }}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-48">
        <DropdownMenuLabel>{{ username }}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="openSettings">
          <span
            class="icon-[lucide--settings] mr-2 size-4 text-muted-foreground"
          ></span>
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="quit">
          <span
            class="icon-[lucide--log-out] mr-2 size-4 text-destructive/80"
          ></span>
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
