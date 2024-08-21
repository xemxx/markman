<script setup lang="ts">
import { theme } from 'ant-design-vue'
</script>

<template>
  <a-config-provider
    :theme="{
      algorithm: theme.darkAlgorithm,
    }"
  >
    <router-view />
  </a-config-provider>
</template>

<style></style>
