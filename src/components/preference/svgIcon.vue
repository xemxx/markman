<template>
  <svg aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  prefix: {
    type: String,
    default: 'sprite',
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

const symbolId = computed(() => `/__spritemap#${props.prefix}-${props.name}`)
</script>

<style scoped>
.iconwrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.item {
  padding: 15px;
}
.name {
  font-size: 12px;
  margin-top: 10px;
  color: #666;
}
</style>
