<template>
  <div class="layout">
    <Layout :style="{minHeight: '100vh'}">
      <Sider hide-trigger>
        <Floder @load-article="loadArticle" />
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
  },
  methods: {
    loadArticle(id) {
      let user = "xem";
      let data;
      this.$db.queryData(
        `select * from floder_article as a join article as b on a.aid=b.id where a.fid=${id} and b.username="${user}"`,
        rows => {
          data = rows;
        }
      );
      console.log(data);
    }
  }
};
</script>
<style lang="scss" scoped>
.layout {
  height: 100vh;
}
</style>