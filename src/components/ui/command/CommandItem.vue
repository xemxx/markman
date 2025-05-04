<script setup lang="ts">
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

function handleClick() {
  if (!props.disabled) {
    emit('select')
  }
}
</script>

<template>
  <div
    class="command-item"
    :class="{ 'command-item-disabled': disabled }"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<style scoped>
.command-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color 0.2s;
}

.command-item:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.command-item-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
