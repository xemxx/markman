<template>
  <div class="pref-general">
    <h4>General</h4>
    <bool description="Automatically save document changes." :bool="autoSave"
      :onChange="value => onSelectChange('autoSave', value)"></bool>
    <Input description="The delay in milliseconds between a change being made and saved."
      :onChange="value => onSelectChange('autoSaveDelay', value)" :val="autoSaveDelay" after="ms">
    </Input>
  </div>
</template>

<script setup lang="ts">
import Input from './common/input.vue'
import Bool from './common/bool.vue'

import { usePreferenceStore } from '@/store/preference'
const preference = usePreferenceStore()
// computed: {
//   ...mapState({
//     autoSave: state => state.preference.autoSave,
//     autoSaveDelay: state => state.preference.autoSaveDelay,
//   }),
// },
const { autoSave, autoSaveDelay } = preference

const onSelectChange = (type, value) => {
  // 当选择项改变后，改变设置项
  preference.setOne({ type, value })
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

    & .a-button--small
      margin-left 25px

    & label
      display block
      margin 20px 0
</style>
