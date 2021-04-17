<template>
  <a-layout class="sign">
    <a-layout-header class="center-text sign-header">
      <router-link to="in">登陆</router-link>
      <router-link to="up">注册</router-link>
    </a-layout-header>
    <a-layout-content class="sign-body">
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
.sign-header
  font-size 24px
  padding-top 12px

  a
    padding 0 12px

.sign-body
  padding 20px
</style>
