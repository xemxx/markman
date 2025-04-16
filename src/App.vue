<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import MigrationTool from '@/components/MigrationTool.vue'
import { useTheme } from '@/lib/theme'
useTheme()
</script>

<template>
  <Toaster />
  <MigrationTool />
  <router-view />
</template>

<style></style>
