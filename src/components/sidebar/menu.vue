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
const router = useRouter()
const quit = () => {
  user.unSetCurrentUser().then(() => {
    router.push('/login').catch(err => console.log(err))
  })
}
const user = useUserStore()
const username = user.username
</script>

<template>
  <div class="flex justify-between">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div class="flex p-1">
          <span class="icon-[lucide--square-user-round] size-7"></span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-48">
        <DropdownMenuLabel>{{ username }}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="quit">
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <!-- <div class="grid grid-cols-1 place-content-center">
      <span class="icon-[lucide--settings] size-8"></span>
      <span class="icon-[lucide--log-out] size-6"></span>
    </div> -->
  </div>
</template>
