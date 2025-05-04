<template>
  <div class="pref-general mt-5">
    <Bool v-model="autoSave">是否自动保存</Bool>
    <Input v-model="autoSaveDelay" after="ms"> 自动保存时延，单位毫秒 </Input>
    <Select v-model="themeType" :items="themeArr"> 主题选择 </Select>
  </div>
</template>

<script setup lang="ts">
import Input from './common/input.vue'
import Bool from './common/bool.vue'
import Select from './common/select.vue'

import { usePreferenceStore } from '@/store'
import { storeToRefs } from 'pinia'

const preference = usePreferenceStore()
const { autoSave, autoSaveDelay, themeType } = storeToRefs(preference)

// 定义当前主题列表
const themeArr = [
  {
    id: 0,
    value: 'light',
    icon: 'theme-light',
    label: '极简白',
  },
  {
    id: 1,
    value: 'dark',
    icon: 'theme-dark',
    label: '极夜黑',
  },
  {
    id: 2,
    value: 'system',
    icon: 'theme-system',
    label: '跟随系统',
  },
]
</script>

<style lang="stylus" scoped></style>
