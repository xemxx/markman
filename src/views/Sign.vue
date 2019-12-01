<template>
  <div>
    <Layout style="height:100vh">
      <Header>
        <router-link to="in">登陆</router-link>
        <router-link to="up">注册</router-link>
      </Header>
      <Content style="padding-top:20px">
        <router-view></router-view>
      </Content>
      <Footer>Footer</Footer>
    </Layout>
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

<style></style>
