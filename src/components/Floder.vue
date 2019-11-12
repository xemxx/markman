<template>
  <div class="floder">
    <Menu active-name="1-2" :open-names="['2']" width="auto" :style="{height:'100vh'}">
      <Submenu name="1">
        <template slot="title">
          <Icon type="ios-analytics" />收藏夹
        </template>
        <MenuItem name="1-1">linux</MenuItem>
      </Submenu>
      <Submenu name="2">
        <template slot="title">
          <Icon type="ios-filing" />记事本
        </template>
        <MenuItem name="2-1">我的</MenuItem>
      </Submenu>
    </Menu>
  </div>
</template>

<script>
export default {
  name: "floder",
  methods: {}
};
</script>

<style lang="scss">
.floder {
  height: 100vh;
}
</style>