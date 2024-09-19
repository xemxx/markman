<template>
  <div class="mb-4">
    <div class="mb-2">
      <slot></slot>
    </div>
    <div class="relative w-full items-center">
      <Input v-model="model" class="pr-8" />
      <span
        v-if="after"
        class="absolute inset-y-0 end-0 flex items-center justify-center px-2"
      >
        {{ after }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
const model = defineModel({ type: Number })
const props = defineProps<{
  after?: string
}>()
</script>
