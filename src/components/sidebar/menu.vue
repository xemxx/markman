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
        class="flex items-center gap-2.5 outline-none focus-visible:ring-0 group"
      >
        <div
          class="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary/10"
        >
          <span class="icon-[lucide--user] size-4" />
        </div>
        <span class="text-sm font-medium text-foreground/90">{{ username }}</span>
        <span class="icon-[lucide--chevron-down] size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-52" align="start">
        <DropdownMenuLabel class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="icon-[lucide--user] size-3.5 text-primary" />
          </div>
          <span class="font-medium">{{ username }}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="openSettings" class="cursor-pointer">
          <span class="icon-[lucide--settings] mr-2.5 size-4 text-muted-foreground" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="quit" class="cursor-pointer text-destructive focus:text-destructive">
          <span class="icon-[lucide--log-out] mr-2.5 size-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
