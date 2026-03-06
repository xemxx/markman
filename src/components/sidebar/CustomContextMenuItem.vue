<template>
  <div
    class="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    :class="{ 'pointer-events-none opacity-50': disabled }"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, inject } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits(['click'])

const closeContextMenu = inject<() => void>('closeContextMenu')

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('click', event)
  closeContextMenu?.()
}
</script>
