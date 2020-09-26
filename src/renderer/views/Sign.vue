<template>
  <a-layout class="sign">
    <a-layout-header>
      <router-link to="in">登陆</router-link>
      <router-link to="up">注册</router-link>
    </a-layout-header>
    <a-layout-content style="padding-top: 20px">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script>
export default {
  name: 'Sign',
  data() {
    return {}
  },
}
</script>

<style lang="stylus" scoped>
.sign
  & .a-layout-header
    text-align center
</style>
