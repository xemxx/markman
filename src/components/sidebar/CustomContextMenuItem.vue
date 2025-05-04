<template>
  <div
    class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
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
