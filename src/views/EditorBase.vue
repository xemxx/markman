<template>
  <div class="container">
    <Sidebar />
    <Editor />
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/sidebar/index.vue'
import Editor from '@/components/editor/editor.vue'
import { usePreferenceStore } from '@/store/preference'
import { useListenStore } from '@/store/listen'
import { useSyncStore } from '@/store/sync'

const preference = usePreferenceStore()
const listen = useListenStore()
const sync = useSyncStore()

// 监听内容变动
listen.listenFileSave()
// 监听偏好设置即时生效
preference.getLocal()

sync.sync()
</script>
<style lang="stylus" scoped>
.container
  display flex
  flex-direction row
  height 100vh
</style>
