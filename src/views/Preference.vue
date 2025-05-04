<template>
  <div class="w-svh flex h-svh pr-10">
    <PSidebar class="w-72" />
    <div class="flex-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import PSidebar from '@/components/preference/sidebar/index.vue'
</script>

<style scoped></style>
