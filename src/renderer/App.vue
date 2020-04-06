<template>
  <div id="app">
    <el-container>
      <el-header height="auto">
        <TitleBar />
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import TitleBar from './components/TitleBar.vue'
export default {
  name: 'app',
  components: {
    TitleBar
  }
}
</script>

<style lang="stylus" scoped>
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  color #2c3e50
  height 100vh
  overflow hidden
</style>
