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
import Floder from '@/components/Floder'
import List from '@/components/List.vue'
import Editor from '@/components/Editor'

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
      sidebar: state => state.preference.toggleSidebar
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
      dispatch('listenPreview')
      // 监听偏好设置即时生效
      dispatch('preference/getLocal')
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
  flex 1
  display flex
  position relative
  top -22px
  height 100vh
  padding-top 22px
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
