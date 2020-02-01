<template>
  <div class="layout">
    <div v-show="sidebar" class="sidebar">
      <div class="floder">
        <Floder />
      </div>
      <div class="list">
        <List />
      </div>
    </div>
    <div class="editor">
      <Editor />
    </div>
  </div>
</template>

<script>
import Floder from '@/components/Floder.vue'
import List from '@/components/List.vue'
import Editor from '@/components/editor'

import { mapState } from 'vuex'

export default {
  name: 'index',
  components: {
    Floder,
    List,
    Editor
  },
  data: () => {
    return {}
  },
  computed: {
    ...mapState({
      sidebar: state => state.sidebar
    })
  },
  created() {
    this.$store.dispatch('sync/sync')
    this.listen()
  },
  methods: {
    listen() {
      const { dispatch } = this.$store
      dispatch('listenSidebar')
      dispatch('listenFileSave')
    }
  }
}
</script>
<style lang="stylus" scoped>
.layout
  display flex
  flex-direction row
  height 100%

.sidebar
  display flex
  flex 1
  max-width 400px
  min-width 100px

.floder, .list
  flex 1
  max-width 200px
  min-width 50px

.floder
  background-color floder-bc

.list
  background-color list-bc

.editor
  flex 1
</style>
