<template>
  <div v-show="sidebar" class="sidebar">
    <Notebooks class="notebooks" />
    <Notes class="notes" />
  </div>
</template>

<script>
import Notebooks from './notebooks'
import Notes from './notes'

import { mapState } from 'vuex'

export default {
  name: 'Sidebar',
  computed: {
    ...mapState({
      sidebar: state => state.preference.toggleSidebar,
    }),
  },
  components: {
    Notebooks,
    Notes,
  },
}
</script>

<style lang="stylus" scoped>
.sidebar
  flex 1
  display flex
  max-width 400px
  width 400px
  border-right 1px solid
  padding-top var(--titleBarHeight)
  background var(--sideBarBgColor)
  color var(--sideBarColor)

.notebooks, .notes
  flex 1
  max-width 200px
  width 200px

.notebooks
  background-color transparent

.notes
  background-color transparent
</style>
