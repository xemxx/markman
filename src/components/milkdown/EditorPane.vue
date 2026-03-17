<template>
  <MilkdownProvider>
    <CrepeEditor />
  </MilkdownProvider>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import CrepeEditor from './CrepeEditor.vue'
</script>
