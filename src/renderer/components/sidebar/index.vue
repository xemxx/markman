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
      sidebar: state => state.preference.toggleSidebar
    })
  },
  components: {
    Notebooks,
    Notes
  }
}
</script>

<style lang="stylus" scoped>
.layout
  display flex
  flex-direction row
  height 100%

.sidebar
  flex 1
  display flex
  position relative
  top -22px
  height 100vh
  padding-top 22px
  max-width 400px
  width 400px

.notebooks, .notes
  flex 1
  max-width 200px
  width 200px

.notebooks
  background-color notebooks-bc

.notes
  background-color list-bc
</style>
