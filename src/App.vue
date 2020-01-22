<template>
  <div id="app">
    <el-container>
      <el-header height="auto">
        {{title}}
        <!-- 如果是windows平台 -->
        <div class="handle-bar" v-if="isWin">
          <i class="el-icon-minus" @click="minimizeWindow"></i>
          <i class="el-icon-close" @click="closeWindow"></i>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { BrowserWindow } from "electron";
export default {
  name: "app",
  created() {
    // 从数据库读用户数据初始化
    let store = this.$store;
    let ustate = store.state.user;
    this.$store
      .dispatch("user/loadActiver")
      .then(() => {
        // 如果认定存在活动用户则进行开始判断网络状态
        // 如果可联网 刷新用户状态，向服务端获取新token
        // 默认token可使用30天，如果连续30天不登录将被取消登录状态
        if (store.state.online) {
          this.$axios
            .post(ustate.server + "/user/flashToken")
            .then(data => {
              //刷新成功
              store.dispatch("user/flashToken", data.token);
              this.sync();
              setTimeout(() => {
                this.$router.push("/home").catch(err => err);
              }, 1000);
            })
            .catch(() => {
              //先自身解析token是否超时，如果超时直接跳转到登录界面，否则认定为离线编辑状态
              let data = JSON.parse(
                decodeURIComponent(
                  escape(window.atob(ustate.token.split(".")[1]))
                )
              );
              if (data.exp > Date.parse(new Date()) / 1000) {
                //离线编辑
                this.sync();
                setTimeout(() => {
                  this.$router.push("/home").catch(err => err);
                }, 1000);
              } else {
                //用户登录失效
                store.dispatch("user/unsetActiver");
                setTimeout(() => {
                  this.$router.push("/sign/in").catch(err => err);
                }, 1000);
              }
            });
        }
      })
      .catch(err => {
        console.log(err);
        setTimeout(() => {
          this.$router.push("/sign/in").catch(err => err);
        }, 1000);
      });
  },
  computed: {
    isWin: () => {
      return process.platform === "win32";
    },
    title: () => {
      return "MarkMan";
    }
  },
  methods: {
    sync() {
      const store = this.$store;
      //开始同步数据
      //TODO 增量同步具体实现
      store
        .dispatch("sync/incrementalSync")
        .then(() => {
          setTimeout(() => {
            store.commit("sync/update_isSyncing", false);
          }, 3000);
          store.dispatch("notebook/flashList");
        })
        .catch(err => {
          console.log(err);
        });
    },
    minimizeWindow() {
      const window = BrowserWindow.getFocusedWindow();
      window.minimize();
    },
    closeWindow() {
      const window = BrowserWindow.getFocusedWindow();
      window.close();
    }
  }
};
</script>

<style lang="stylus" scoped >
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}

.el-header {
  text-align: center;
  -webkit-app-region: drag;

  & .handle-bar {
    float: right;
  }
}

.el-main {
  overflow: auto;
}
</style>
