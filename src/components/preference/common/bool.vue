<template>
  <div class="mb-4">
    <div class="mb-2">
      <slot></slot>
    </div>
    <div class="flex items-center space-x-2">
      <Switch :checked="model" @update:checked="update" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

const model = defineModel({ required: true, type: Boolean })
const update = (value: boolean) => {
  model.value = value
}
</script>
