<template>
  <div class="layout">
    <Sidebar />
    <Editor />
  </div>
</template>

<script>
import Sidebar from '@/components/sidebar'
import Editor from '@/components/editor'

export default {
  name: 'Base',
  components: {
    Sidebar,
    Editor,
  },
  data: () => {
    return {}
  },
  created() {
    this.$store.dispatch('sync/sync')
    this.listen()
  },
  methods: {
    listen() {
      const { dispatch } = this.$store
      dispatch('listenFileSave')
      // 监听偏好设置即时生效
      dispatch('preference/getLocal')
    },
  },
}
</script>
<style lang="stylus" scoped>
.layout
  display flex
  flex-direction row
  height 100%
</style>
