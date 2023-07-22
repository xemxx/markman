<template>
  <a-layout-footer class="toolbar">
    <SyncOutlined v-model:spin="isSyncing" @click.stop="doSync" />
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <LogoutOutlined @click.stop="quit" />
  </a-layout-footer>
</template>

<script setup lang="ts">
import { SyncOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useSyncStore } from '@/store/sync'
import { useUserStore } from '@/store/user'
import { useRouter } from '@/router'
import { storeToRefs } from 'pinia'

const sync = useSyncStore()
const { isSyncing } = storeToRefs(sync)
console.debug(isSyncing)
const doSync = sync.sync
const user = useUserStore()
const router = useRouter()

const quit = () => {
  user.unSetActiver().then(() => {
    router.push('/sign/in').catch(err => err)
  })
}
</script>

<style lang="stylus" scoped>
.toolbar
  color var(--sideBarColor)
  display flex
  justify-content space-between
  align-items center
  border-top 1px solid black
  padding 2px 5px
  p
    text-align center
    flex 1
</style>
