<template>
  <TitleBar />
  <div class="layout">
    <Sidebar />
    <Editor />
  </div>
</template>

<script>
import Sidebar from '@/components/sidebar'
import Editor from '@/components/editor'
import TitleBar from '@/components/titleBar'

export default {
  name: 'Editor',
  components: {
    Sidebar,
    Editor,
    TitleBar,
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
  height 'calc(100% - %s)' % titleBarHeight
</style>
