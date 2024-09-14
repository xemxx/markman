<template>
  <div class="h-full select-none space-y-4 px-3 py-4">
    <h2 class="mb-2 px-4 text-center text-lg font-semibold tracking-tight">
      Preferences
    </h2>
    <div class="space-y-1">
      <Button
        :variant="item.label === currentCategory ? 'secondary' : 'ghost'"
        class="w-full justify-start text-lg"
        v-for="item of category"
        :key="item.name"
        :class="{ active: item.label === currentCategory }"
        @click="handleCategoryItemClick(item.path, item.label)"
      >
        <SvgIcon :name="item.icon" class="mr-2 h-4 w-4" />
        {{ item.name }}
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { category as categoryC } from './config'
import SvgIcon from '@/components/preference/svgIcon.vue'
import { reactive, ref } from 'vue'
import { useRouter } from '@/router'
const category = reactive(categoryC)
const currentCategory = ref('general')

const router = useRouter()

// TODO: maybe
// $route(to, from) {
//   if (to.name !== from.name) {
//     this.currentCategory = to.name
//   }
// },

// const handleSelect = item => {
//   router.push({
//     path: `/preference/${item.category.toLowerCase()}`,
//   })
// }

const handleCategoryItemClick = (path: string, label: string) => {
  currentCategory.value = label
  router.push(path).catch(err => err)
}
</script>

<style lang="stylus"></style>
