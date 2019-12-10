<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "app",
  async created() {
    // 从数据库读用户数据初始化
    let store = this.$store;
    let ustate = store.state.user;
    this.$store.dispatch("user/init").then(isLogin => {
      // 如果认定存在活动用户则进行开始判断网络状态
      if (isLogin) {
        // 如果可联网 刷新用户状态，向服务端获取新token
        // 默认token可使用30天，如果连续30天不登录将被取消登录状态
        if (store.state.online) {
          //请求服务端token 将旧的token提交即可获取新的token
          this.$axios
            .post(ustate.server + "/flashToken", {
              //TODO 服务端接口开发
              token: ustate.token
            })
            .then(data => {
              if (data.err == 200) {
                //代表用户合法，进入主界面，然后进行笔记数据渲染与同步
                ustate.model.updateToken(data.data.token, ustate.id);
                store.commit("user/update_token", data.data.token);
                setTimeout(() => {
                  this.$router.push("/home").catch(err => err);
                }, 1000);
              } else {
                // token超时，需要重新登录再次获取token
                ustate.model.updateState("0", ustate.id); //注销活动用户
                store.commit("user/update_token", "");
                setTimeout(() => {
                  this.$router.push("/sign/in").catch(err => err);
                }, 1000);
              }
            })
            .catch(err => {
              console.log(err);
              store.commit("update_online", false);
              //由于安全系数要求并不高，所以在请求失败时认定为断网，只要自身解析token未超时则可本地离线编辑，后续考虑添加用户自定义设置，例如本地密码
              //先自身解析token是否超时，如果超时直接跳转到登录界面，否则认定为离线编辑状态
              let data = JSON.parse(
                decodeURIComponent(
                  escape(window.atob(ustate.token.split(".")[1]))
                )
              );
              console.log(data);
              console.log(Date.parse(new Date()) / 1000);
              if (data.exp > new Date().getTime() / 1000) {
                setTimeout(() => {
                  this.$router.push("/home").catch(err => err);
                }, 1000);
              } else {
                ustate.model.updateState("0", ustate.id); //注销活动用户
                store.commit("user/update_token", "");
                setTimeout(() => {
                  this.$router.push("/sign/in").catch(err => err);
                }, 1000);
              }
            });
        }
      } else {
        setTimeout(() => {
          this.$router.push("/sign/in").catch(err => err);
        }, 1000);
      }
    });
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
}
#app {
  height: "100vh";
}
</style>
