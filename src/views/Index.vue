<template>
  <div class="layout">
    <Layout :style="{minHeight: '100vh'}">
      <Sider hide-trigger>
        <Floder />
      </Sider>
      <!-- <Sider hide-trigger>file</Sider> -->
      <Content>editor</Content>
    </Layout>
  </div>
</template>

<script>
import Floder from "@/components/Floder.vue";
export default {
  name: "home",
  components: {
    Floder
  }
};
</script>
<style lang="scss" scoped>
.layout {
  height: 100vh;
}
</style>