<template>
  <div class="container">
    <Sidebar />
    <Editor />
  </div>
</template>

<script>
import Sidebar from '@/components/sidebar'
import Editor from '@/components/editor'

export default {
  name: 'EditorBase',
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
.container
  display flex
  flex-direction row
  height 100vh
</style>
