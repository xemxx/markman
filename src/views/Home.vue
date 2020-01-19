<template>
  <div class="layout">
    <Layout :style="{ minHeight: '100vh' }">
      <Sider hide-trigger>
        <Floder />
      </Sider>
      <Sider hide-trigger>
        <List />
      </Sider>
      <Content>
        <Editor></Editor>
      </Content>
    </Layout>
  </div>
</template>

<script>
import Floder from "@/components/Floder.vue";
import List from "@/components/List.vue";
import Editor from "@/components/editor";

export default {
  name: "index",
  components: {
    Floder,
    List,
    Editor
  },
  created() {},
  methods: {}
};
</script>
<style lang="stylus" scoped>
.layout {
  height: 100vh;
}
</style>
