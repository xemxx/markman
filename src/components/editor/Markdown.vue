<template>
  <div class="editor-wrapper">
    <div v-show="!select">no file checked</div>
    <div ref="editor" class="editor-markdown">
      <textarea v-model="markdown"></textarea>
    </div>
    <div ref="preview" class="editor-preview">{{preview}}</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import marked from "marked";
export default {
  name: "markdown",
  data() {
    return {
      preview: "",
      select: false
    };
  },
  props: {
    markdown: String,
    platform: String
  },
  computed: {
    ...mapState({
      //sourceCode: state => state.preferences.sourceCode
    })
  },
  watch: {
    markdown: () => {
      this.preview = marked(this.markdown);
      if (this.markdown != undefined) {
        this.select = true;
      } else {
        this.select = false;
      }
    }
  },
  created() {
    this.$nextTick(() => {
      let { markdown } = this;
      this.preview = marked(markdown);
      // this.editor.on("change", changes => {
      //   this.$store.dispatch(
      //     "note/listen_for_markdown_change",
      //     Object.assign(changes, { id: "muya" })
      //   );
      // });
    });
  }
};
</script>

<style lang="stylus" scoped>
.editor-wrapper {
  height: 100%;
  position: relative;
  flex: 1;
  padding: 10px 100px;
  //   color: var(--editorColor);
  & .ag-dialog-table {
    & .el-button {
      font-size: 13px;
      width: 70px;
    }
  }
}
// .editor-wrapper.source {
//   position: absolute;
//   z-index: -1;
//   top: 0;
//   left: 0;
//   overflow: hidden;
// }
.editor-markdown {
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}
.editor-preview {
  height: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}
</style>