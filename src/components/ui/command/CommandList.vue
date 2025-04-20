<template>
  <div class="command-list">
    <slot />
  </div>
</template>

<style scoped>
.command-list {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
