<template>
  <a-flex v-show="toggleSidebar" class="sidebar">
    <ActivityBar class="activity" />
    <TocBar class="toc" />
  </a-flex>
</template>

<script setup lang="ts">
import { usePreferenceStore } from '@/store/preference'
import { storeToRefs } from 'pinia'
import ActivityBar from './activityBar.vue'
import TocBar from './tocBar.vue'

const preference = usePreferenceStore()
console.log(preference.toggleSidebar)
const { toggleSidebar } = storeToRefs(preference)
</script>

<style lang="stylus" scoped>
.sidebar
  max-width 400px
  width 400px
  padding-top var(--titleBarHeight)
  background var(--sideBarBgColor)
  color var(--sideBarColor)

.activity, .toc
  max-width 200px
  width 200px
  border-right 1px solid #000000
  background-color transparent
</style>
