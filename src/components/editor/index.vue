<template>
  <div class="editor">
    <div class="title">
      <input v-model="title" />
    </div>
    <div class="content">
      <Markdown :markdown="markdown"></Markdown>
      <!-- <source-code v-if="sourceCode" :markdown="markdown"></source-code> -->
    </div>
    <div class="tags">
      <ul>
        <li v-for="item in tags" :key="item.id">{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import Markdown from "./Markdown.vue";
// import SourceCode from "./SourceCode.vue";
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
      markdown: state => state.note.detail.markdown,
      title: state => state.note.detail.title
      // sourceCode: state => state.preferences.sourceCode
    })
  },
  components: {
    Markdown
  },
  methods: {
    // save(type) {
    //   let nowOs = this.$store.state.platform === "darwin" ? "meta" : "ctrl";
    //   if (type == nowOs) {
    //     this.$store.dispatch("note/update", {
    //       title: encodeURI(this.title),
    //       content: encodeURI(this.content),
    //       isModify: true,
    //       modifyDate: Date.parse(new Date()) / 1000
    //     });
    //   }
    // }
  }
};
</script>

<style lang="stylus" scoped>
.editor {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.title {
  display: flex;
  & input {
    flex: 1;
  }
}
.content {
  display: flex;
  flex: 1;
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