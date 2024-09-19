<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useTheme } from '@/lib/theme'
useTheme()
</script>

<template>
  <Toaster />
  <router-view />
</template>

<style></style>
