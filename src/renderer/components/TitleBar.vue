<template>
  <div class="title-bar">
    {{ title }}
    <!-- 如果是windows平台 -->
    <div class="handle-bar" v-if="isWin">
      <i class="el-icon-minus" @click="minimizeWindow"></i>
      <i class="el-icon-close" @click="closeWindow"></i>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
export default {
  computed: {
    isWin: () => {
      return process.platform === 'win32'
    },
    title: () => {
      return 'MarkMan'
    }
  },
  methods: {
    minimizeWindow() {
      const window = remote.getCurrentWindow()
      window.minimize()
    },
    closeWindow() {
      const window = remote.getCurrentWindow()
      window.close()
    }
  }
}
</script>

<style lang="stylus" scoped>
.title-bar
  width 100%
  text-align center
  -webkit-app-region drag
  background floder-bc

  & .handle-bar
    float right
</style>
