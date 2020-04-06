<template>
  <div class="pref-general">
    <h4>General</h4>
    <bool
      description="Automatically save document changes."
      :bool="autoSave"
      :onChange="value => onSelectChange('autoSave', value)"
    ></bool>
    <range
      description="The delay in milliseconds between a change being made and saved."
      :value="autoSaveDelay"
      :min="1000"
      :max="10000"
      unit="ms"
      :step="100"
      :onChange="value => onSelectChange('autoSaveDelay', value)"
    ></range>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Range from './common/range'
import Bool from './common/bool'

export default {
  components: {
    Bool,
    Range
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      autoSave: state => state.preferences.autoSave,
      autoSaveDelay: state => state.preferences.autoSaveDelay
    })
  },
  methods: {
    onSelectChange(type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    },
    selectDefaultDirectoryToOpen() {
      this.$store.dispatch('SELECT_DEFAULT_DIRECTORY_TO_OPEN')
    }
  }
}
</script>

<style lang="stylus" scoped>
.pref-general
  & h4
    text-transform uppercase
    margin 0
    font-weight 400

  & .startup-action-ctrl
    font-size 14px
    user-select none
    margin 20px 0
    color var(--editorColor)

    & .el-button--small
      margin-left 25px

    & label
      display block
      margin 20px 0
</style>
