<template>
  <div class="toolbar flex justify-between border-t">
    <!-- <SyncOutlined v-model:spin="isSyncing" @click.stop="doSync" /> -->
    <span
      class="icon-[lucide--refresh-cw] size-5"
      :class="[isSyncing ? 'animate-spin' : '']"
      @click.stop="doSync"
    ></span>
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <span class="icon-[lucide--log-out] size-5" @click.stop="quit" />
  </div>
</template>

<script setup lang="ts">
import { useSyncStore, useUserStore, useSidebarStore } from '@/store'
import { useRouter } from '@/router'
import { storeToRefs } from 'pinia'

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

<style lang="stylus" scoped>
.toolbar
  height 36px
  align-items center
  padding 2px 5px
  p
    text-align center
    flex 1
</style>
