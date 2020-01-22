<template>
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
  computed: {
    isWin: () => {
      return process.platform === "win32";
    }
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
  flex-direction: row;
  height: 100%;
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
