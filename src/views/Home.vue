<template>
  <div class="layout">
    <div class="toolbar">
      <Floder />
    </div>
    <div class="listView">
      <List />
    </div>
    <div class="editor">
      <Editor></Editor>
    </div>
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

.toolbar {
  height: 100vh;
  max-width: 200px;
  align-items left
}

.listView {
  height: 100vh;
  max-width: 200px;
}

.editor {
  height: 100vh;
  width: auto;
}
</style>
