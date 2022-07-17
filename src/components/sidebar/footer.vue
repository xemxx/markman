<template>
  <a-layout-footer class="toolbar">
    <SyncOutlined v-model:spin="isSyncing" @click.stop="sync" />
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <LogoutOutlined @click.stop="quit" />
  </a-layout-footer>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { SyncOutlined, LogoutOutlined } from '@ant-design/icons-vue'
export default {
  computed: {
    ...mapState({
      isSyncing: state => state.sync.isSyncing,
    }),
  },
  methods: {
    ...mapActions({
      sync: 'sync/sync',
    }),
    quit() {
      this.$store.dispatch('user/unSetActiver').then(() => {
        this.$router.push('/sign/in').catch(err => err)
      })
    },
  },
  components: { SyncOutlined, LogoutOutlined },
}
</script>

<style lang="stylus" scoped>
.toolbar
  color var(--sideBarColor)
  display flex
  justify-content space-between
  align-items center

  p
    text-align center
    flex 1
</style>
