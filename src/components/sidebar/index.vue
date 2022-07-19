<template>
  <div v-show="sidebar" class="sidebar">
    <ActivityBar class="activity" />
    <TocBar class="toc" />
  </div>
</template>

<script>
import ActivityBar from './activityBar.vue'
import TocBar from './tocBar.vue'

import { mapState } from 'vuex'

export default {
  name: 'Sidebar',
  computed: {
    ...mapState({
      sidebar: state => state.preference.toggleSidebar,
    }),
  },
  components: {
    ActivityBar,
    TocBar,
  },
}
</script>

<style lang="stylus" scoped>
.sidebar
  flex 1
  display flex
  max-width 400px
  width 400px
  padding-top var(--titleBarHeight)
  background var(--sideBarBgColor)
  color var(--sideBarColor)

.activity, .toc
  flex 1
  max-width 200px
  width 200px
  border-right 1px solid #000000

.activity
  background-color transparent

.toc
  background-color transparent
</style>
