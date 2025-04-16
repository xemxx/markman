<script setup lang="ts">
import TreeItem from './treeItem.vue'

import type { TreeNode } from '@/store/sidebar'

withDefaults(
  defineProps<{
    treeItems: TreeNode[]
    level?: number
  }>(),
  { level: 0 },
)
</script>

<template>
  <li v-for="tree in treeItems" :key="tree.key">
    <TreeItem :tree="tree" :level="level" :selected="tree.selected" />
  </li>
</template>
