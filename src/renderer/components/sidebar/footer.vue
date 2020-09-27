<template>
  <div class="toolbar">
    <SyncOutlined spin @click.stop="sync" />
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <LogoutOutlined @click.stop="quit" />
  </div>
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
  background-color wheat
  color black
  text-align center
  display flex

  p
    flex 1

  i
    padding 3px 5px
    height auto
</style>
