<template>
  <div class="layout">
    <Layout :style="{ minHeight: '100vh' }">
      <Sider hide-trigger>
        <Floder />
      </Sider>
      <Sider hide-trigger>
        <List />
      </Sider>

      <Content>editor</Content>
    </Layout>
  </div>
</template>

<script>
import Floder from "@/components/Floder.vue";
import List from "@/components/List.vue";
// import User from "../model/user.js";
export default {
  name: "index",
  components: {
    Floder,
    List
  },
  created() {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.layout {
  height: 100vh;
}
</style>
