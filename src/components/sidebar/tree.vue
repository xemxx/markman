<script setup lang="ts">
import TreeItem from './treeItem.vue'
import type { TreeNode } from '@/store/sidebar'

const props = withDefaults(
  defineProps<{
    treeItems: TreeNode[]
    level?: number
    sortedTrees: TreeNode[]
  }>(),
  { level: 0 },
)
</script>

<template>
  <ul class="list-none">
    <TreeItem
      v-for="tree in treeItems"
      :key="tree.key"
      :tree="tree"
      :level="level"
      :selected="tree.selected"
      :sorted-trees="sortedTrees"
    />
  </ul>
</template>
