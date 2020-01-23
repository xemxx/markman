<template>
  <div class="editor-wrapper">
    <textarea v-model="markdown"></textarea>
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
    ...mapState({})
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
    });
  }
};
</script>

<style lang="stylus" scoped>
.editor-wrapper {
  height: 100%;
  width: 100%;
  padding 5px 0

  & textarea {
    width: 100%;
    height: 100%;
    border: 0;
    outline: none;
    resize: none;
    background-color: #ffffff;

    // &::-webkit-scrollbar {
    //   width: 0px;
    //   height: 0px;
    // }
  }
}
</style>