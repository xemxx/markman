<template>
  <div class="pref-container">
    <SideBar />
    <div class="pref-content">
      <router-view class="pref-setting"></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@/preferences/sideBar/index.vue'

import { usePreferenceStore } from '@/store/preference'

const preference = usePreferenceStore()
preference.getLocal()
</script>

<style lang="stylus" scoped>
.pref-container
  --prefSideBarWidth 280px
  width 100vw
  height 100vh
  max-width 100vw
  max-height 100vh
  position fixed
  top 0
  left 0
  display flex

  & .pref-content
    position relative
    flex 1
    display flex
    flex-direction column
    max-width calc(100vw - var(--prefSideBarWidth))

    & .pref-setting
      padding 50px 20px
      padding-top var(--titleBarHeight)
      flex 1
      height calc(100vh - var(--titleBarHeight))
      overflow auto

    & span, & div, & h1, & h2, & h3, & h4, & h5
      user-select none

  & .pref-content.frameless .pref-setting
    /* Move the scrollbar below the titlebar */
    margin-top var(--titleBarHeight)
    padding-top 0
</style>
