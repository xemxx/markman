<template>
  <div class="layout">
    <div v-show="mode" class="shider">
      <div class="floder">
        <Floder />
      </div>
      <div class="list">
        <List />
      </div>
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
import { mapState } from "vuex";

export default {
  name: "index",
  components: {
    Floder,
    List,
    Editor
  },
  data: () => {
    return {};
  },
  computed: {
    ...mapState({
      viewMode: state => {
        switch (state.main.viewMode) {
          case "focus":
            return false;
          default:
            return true;
        }
      }
    }),
    isWin: () => process.platform === "win32"
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

.shider {
  display: flex;
  flex: 1;
  max-width: 400px;
  min-width: 100px;
}

.floder, .list {
  flex: 1;
  max-width: 200px;
  min-width: 50px;
}

.floder {
  background-color: floder-bc;
}

.list {
  background-color: list-bc;
}

.editor {
  flex: 1;
}
</style>
