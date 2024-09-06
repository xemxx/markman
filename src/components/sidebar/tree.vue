<script setup lang="ts">
import { TreeItem } from 'radix-vue'
import TreeItemVal from './treeItemVal.vue'

import { TreeNode } from './types'

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
    <TreeItem v-slot="{ isExpanded }" as-child :level="level" :value="tree">
      <TreeItemVal
        :item="tree"
        :is-expanded="isExpanded"
        :style="{ 'padding-left': `${level - 0.5}rem` }"
      ></TreeItemVal>
      <ul v-if="isExpanded && tree.children">
        <Tree :tree-items="tree.children" :level="level + 1" />
      </ul>
    </TreeItem>
  </li>
</template>
