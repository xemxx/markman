<template>
  <div class="title-bar">
    <!-- 如果是windows平台 -->
    <!-- <div class="handle-bar" v-if="isWin">
      <i class="a-icon-minus" @click="minimizeWindow"></i>
      <i class="a-icon-close" @click="closeWindow"></i>
    </div> -->
  </div>
</template>

<script setup lang="ts">
// const { getCurrentWindow } = window.require('@electron/remote')

// const ew = getCurrentWindow()

// const minimizeWindow = () => {
//   ew.minimize()
// }

// const closeWindow = () => {
//   ew.close()
// }
</script>

<style lang="stylus" scoped>
.title-bar
  position fixed
  left 0
  top 0
  right 0
  z-index 2
  transition color 0.4s ease-in-out
  user-select none
  cursor default
  height var(--titleBarHeight)
  text-align center
  -webkit-app-region drag
  background transparent

  & .handle-bar
    float right
</style>
