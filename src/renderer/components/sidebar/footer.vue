<template>
  <div class="toolbar">
    <i @click.stop="sync" class="el-icon-refresh"></i>
    <p v-if="isSyncing">同步中</p>
    <p v-else>同步完成</p>
    <i @click.stop="quit" class="el-icon-switch-button"></i>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
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
