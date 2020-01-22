<template>
  <el-container style="height:100vh">
    <el-header>
      MarkMan
      <div class="handle-bar" v-if="process.platform === 'win32'">
        <!-- 如果是windows平台 -->
        <i class="el-icon-minus" @click="minimizeWindow"></i>
        <i class="el-icon-close" @click="closeWindow"></i>
      </div>
    </el-header>
    <el-main>
      <div class="layout">
        <div class="floder">
          <Floder />
        </div>
        <div class="list">
          <List />
        </div>
        <div class="editor">
          <Editor />
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import Floder from "@/components/Floder.vue";
import List from "@/components/List.vue";
import Editor from "@/components/editor";

import { BrowserWindow } from "electron";

export default {
  name: "index",
  components: {
    Floder,
    List,
    Editor
  },
  created() {},
  methods: {
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
<style lang="stylus" scoped>
.layout {
  display: flex;
  flex-direction: column;
}

.floder, .list {
  flex: 1;
  max-width: 200px;
  min-width: 50px;
}

.editor {
  flex: 1;
}
</style>
