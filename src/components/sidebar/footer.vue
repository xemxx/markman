<template>
  <a-flex class="toolbar" justify="space-between">
    <SyncOutlined v-model:spin="isSyncing" @click.stop="doSync" />
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <LogoutOutlined @click.stop="quit" />
  </a-flex>
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
    router.push('/login').catch(err => err)
  })
}
</script>

<style lang="stylus" scoped>
.toolbar
  height 36px
  color var(--sideBarColor)
  align-items center
  border-top 1px solid black
  padding 2px 5px
  p
    text-align center
    flex 1
</style>
