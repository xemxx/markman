<template>
  <el-container class="editor">
    <el-header height="auto">
      <input v-model="title" class="editor-title" />
    </el-header>
    <el-main>
      <Markdown :markdown="markdown"></Markdown>
    </el-main>
    <el-footer height="auto">
      <div class="tags">
        <ul>
          <li v-for="item in tags" :key="item.id">{{ item.name }}</li>
        </ul>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import Markdown from "./Markdown.vue";
import { mapState } from "vuex";

export default {
  name: "editor",
  data() {
    return {
      tags: [{ id: 1, name: 2 }],
      isModify: false,
      editor: null
    };
  },
  computed: {
    ...mapState({
      markdown: state => state.editor.detail.markdown,
      title: state => state.editor.detail.title
    })
  },
  components: {
    Markdown
  },
  methods: {}
};
</script>

<style lang="stylus" scoped>
.editor, .editor-title {
  background-color: editor-bc;
}

.editor {
  padding 0 10px
}

.editor-title {
  width: 100%;
  padding: 5px 0;
  border: none;
  font-size: 24px;
  font-weight: 500;

  &:focus {
    border: none;
    outline: none;
  }
}

.tags {
  bottom: 0px;
  width: 100%;
  height: auto;
  min-height: 20px;
  background-color: rgb(25, 118, 211);

  & ul {
    list-style-type: none;
    display: inline;

    & li {
      border: 1px;
      border-radius: 5px;
      background-color: aqua;
      padding-left: 10px;
      color: black;
      float: left;
    }
  }
}
</style>