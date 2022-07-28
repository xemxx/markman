<template>
  <section class="pref-switch-item" :class="{ 'ag-underdevelop': disable }">
    <div class="description">
      <span>{{ description }}</span>
      <i v-if="more" class="a-icon-info" @click="handleMoreClick"></i>
    </div>
    <a-switch
      :checked="status"
      checked-children="On"
      un-checked-children="Off"
      @change="handleSwitchChange"
    >
    </a-switch>
  </section>
</template>

<script>
import { shell } from 'electron'

export default {
  props: {
    description: String,
    bool: Boolean,
    onChange: Function,
    more: String,
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      status: this.bool,
    }
  },
  watch: {
    bool: function (value, oldValue) {
      if (value !== oldValue) {
        this.status = value
      }
    },
  },
  methods: {
    handleMoreClick() {
      if (typeof this.more === 'string') {
        shell.openExternal(this.more)
      }
    },
    handleSwitchChange(value) {
      this.onChange(value)
    },
  },
}
</script>

<style lang="stylus">
.pref-switch-item
  font-size 14px
  user-select none
  margin 20px 0
  color var(--editorColor)

.pref-switch-item .description
  margin-bottom 10px

  & i
    cursor pointer
    opacity 0.7
    color var(--iconColor)

  & i:hover
    color var(--themeColor)

span.a-switch__core::after
  top 3px
  left 7px
  width 10px
  height 10px

.a-switch .a-switch__core
  border 2px solid var(--iconColor)
  background transparent
  box-sizing border-box

span.a-switch__label
  color var(--editorColor50)

.a-switch:not(.is-checked) .a-switch__core::after
  background var(--iconColor)
</style>
