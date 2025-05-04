<script setup lang="ts">
defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <div class="command-input">
    <input
      type="text"
      :placeholder="placeholder || '搜索...'"
      class="command-input-field"
    />
  </div>
</template>

<style scoped>
.command-input {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 0.5rem;
}

.command-input-field {
  flex: 1;
  height: 2.5rem;
  width: 100%;
  background-color: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  outline: none;
  border: none;
}
</style>
