<template>
  <div class="pref-sidebar">
    <h3 class="title">Preferences</h3>
    <section class="category">
      <div
        v-for="item of category"
        :key="item.name"
        class="item"
        :class="{ active: item.label === currentCategory }"
        @click="handleCategoryItemClick(item.path)"
      >
        <SvgIcon :name="item.icon" />
        <span>{{ item.name }}</span>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { category as categoryC } from './config'
import SvgIcon from '@/components/svgIcon.vue'
import { reactive, ref } from 'vue'
import { useRouter } from '@/router'
import GeneralIcon from '@/assets/icons/pref_general.svg'
const category = reactive(categoryC)
const currentCategory = ref('general')

console.log(GeneralIcon)

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

const handleCategoryItemClick = path => {
  router.push(path).catch(err => err)
}
</script>

<style lang="stylus">
.pref-sidebar
  -webkit-app-region drag
  background var(--sideBarBgColor)
  width var(--prefSideBarWidth)
  height 100vh
  padding-top 40px
  box-sizing border-box

  & h3
    margin 0
    font-weight 400
    text-align center
    color var(--sideBarColor)

.category
  -webkit-app-region no-drag

  & .item
    width 100%
    height 50px
    font-size 18px
    color var(--sideBarColor)
    padding-left 20px
    box-sizing border-box
    display flex
    flex-direction row
    align-items center
    cursor pointer
    position relative
    user-select none

    &:hover
      background var(--sideBarItemHoverBgColor)

    &::before
      content ''
      width 4px
      height 0
      background var(--highlightThemeColor)
      position absolute
      left 0
      border-top-right-radius 3px
      border-bottom-right-radius 3px
      transition height 0.25s ease-in-out
      top 50%
      transform translateY(-50%)

    &.active
      color var(--sideBarTitleColor)

    &.active::before
      height 100%
</style>
