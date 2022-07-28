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

const preference = usePreferenceStore()
const listen = useListenStore()

// 监听内容变动
listen.listenFileSave()
// 监听偏好设置即时生效
preference.getLocal()
</script>
<style lang="stylus" scoped>
.container
  display flex
  flex-direction row
  height 100vh
</style>
