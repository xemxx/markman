<template>
  <section class="pref-range-item" :class="{ 'ag-underdevelop': disable }">
    <div class="description">
      <span
        >{{ description }}:
        <span class="value">{{
          selectValue + (after ? after : '')
        }}</span></span
      >
      <i v-if="more" class="a-icon-info" @click="handleMoreClick"></i>
    </div>
    <a-slider
      v-model:value="selectValue"
      :min="min"
      :max="max"
      :format-tooltip="value => value + (after ? after : '')"
      :step="step"
      @change="select"
    >
    </a-slider>
  </section>
</template>

<script>
import { shell } from 'electron'

export default {
  props: {
    description: String,
    value: Number,
    min: Number,
    max: Number,
    onChange: Function,
    after: String,
    step: Number,
    more: String,
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectValue: this.value,
    }
  },
  watch: {
    value: function (value, oldValue) {
      if (value !== oldValue) {
        this.selectValue = value
      }
    },
  },
  methods: {
    handleMoreClick() {
      if (typeof this.more === 'string') {
        shell.openExternal(this.more)
      }
    },
    select(value) {
      this.onChange(value)
    },
  },
}
</script>

<style lang="stylus">
.pref-range-item
  margin 20px 0
  font-size 14px
  color var(--editorColor)

  & .a-slider
    width 300px

  & .a-slider__runway, & .a-slider__bar
    height 4px

  & .a-slider__button
    width 12px
    height 12px

  & .a-slider__button-wrapper
    width 20px
    height 20px
    top -9px

.pref-select-item .description
  margin-bottom 10px

  & .value
    color var(--editorColor80)

  & i
    cursor pointer
    opacity 0.7
    color var(--iconColor)

  & i:hover
    color var(--themeColor)
</style>
