<script setup lang="ts">
defineProps<{
  heading?: string
}>()
</script>

<template>
  <div class="command-group">
    <div v-if="heading" class="command-group-heading">
      {{ heading }}
    </div>
    <div class="command-group-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.command-group {
  overflow: hidden;
  padding: 0.25rem;
}

.command-group-heading {
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.command-group-content {
  display: flex;
  flex-direction: column;
}
</style>
