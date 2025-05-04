<template>
  <div class="command-container">
    <slot />
  </div>
</template>

<style scoped>
.command-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  background-color: var(--background);
  border-radius: var(--radius);
  overflow: hidden;
}
</style>
