<template>
  <section class="pref-input-item" :class="{ 'ag-underdevelop': disable }">
    <div class="description">
      <span>{{ description }}</span>
      <i v-if="more" class="a-icon-info" @click="handleMoreClick"></i>
    </div>
    <a-input v-model:value="value" :suffix="after" @change="change"> </a-input>
  </section>
</template>

<script>
import { shell } from 'electron'

export default {
  props: {
    description: String,
    val: Number,
    onChange: Function,
    more: String,
    after: String,
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: this.val,
    }
  },
  watch: {
    val: function (value, oldValue) {
      if (value !== oldValue) {
        this.value = value
      }
    },
  },
  methods: {
    handleMoreClick() {
      if (typeof this.more === 'string') {
        shell.openExternal(this.more)
      }
    },
    change() {
      let num = parseInt(this.value, 10) | 0
      this.onChange(num)
    },
  },
}
</script>

<style lang="stylus">
.pref-input-item
  font-size 14px
  user-select none
  margin 20px 0
  color var(--editorColor)

.pref-input-item .description
  margin-bottom 10px

  & i
    cursor pointer
    opacity 0.7
    color var(--iconColor)

  & i:hover
    color var(--themeColor)
</style>
