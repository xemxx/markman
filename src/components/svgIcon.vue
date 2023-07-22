<template>
  <svg aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#6B737B',
  },
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style lang="stylus" scoped>
svg
  width 28px
  height 28px
  fill var(--iconColor)
  margin-right 15px
</style>
