<template>
  <div>
    <el-container class="sign">
      <el-header>
        <router-link to="in">登陆</router-link>
        <router-link to="up">注册</router-link>
      </el-header>
      <el-main style="padding-top:20px">
        <router-view></router-view>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "sign",
  data() {
    return {};
  }
};
</script>

<style lang="stylus" scoped>
.sign
  height 100vh
  & .el-header
    text-align center
</style>

