<script setup lang="ts">
import Milkdown from './MilkdownEditor.vue'
import { MilkdownProvider } from '@milkdown/vue';
</script>

<template>
  <MilkdownProvider>
    <Milkdown />
  </MilkdownProvider>
</template>
