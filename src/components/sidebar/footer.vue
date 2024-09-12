<template>
  <div class="toolbar flex justify-between border-t">
    <SyncOutlined v-model:spin="isSyncing" @click.stop="doSync" />
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <LogoutOutlined @click.stop="quit" />
  </div>
</template>

<script setup lang="ts">
import { SyncOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useSyncStore } from '@/store/sync'
import { useUserStore } from '@/store/user'
import { useRouter } from '@/router'
import { storeToRefs } from 'pinia'
import { useSidebarStore } from '@/store/sidebar'

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
  user.unSetActiver().then(() => {
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
