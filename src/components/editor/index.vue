<template>
  <el-container class="editor">
    <el-header height="auto">
      <input v-model="title" class="editor-title" />
    </el-header>
    <el-main>
      <div class="editor-wrapper">
        <textarea v-model="markdown"></textarea>
      </div>
      <div class="preview-wrapper">
        <div class="pick-line"></div>
        <div v-html="preview" id="preview"></div>
      </div>
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
import { mapState } from 'vuex'
import marked from 'marked'
export default {
  name: 'editor',
  data() {
    return {
      modifyState: false,
      editor: null
    }
  },
  computed: {
    ...mapState({
      preview: state => {
        return marked(state.editor.detail.markdown)
      },
      tags: state => state.editor.tags
    }),
    markdown: {
      get: function() {
        return this.$store.state.editor.detail.markdown
      },
      set: function(newVal) {
        this.$store.commit('editor/update_markdown', newVal)
      }
    },
    title: {
      get: function() {
        return this.$store.state.editor.detail.title
      },
      set: function(newVal) {
        this.$store.commit('editor/update_title', newVal)
      }
    }
  },
  created() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      pedantic: false,
      gfm: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    })
  },
  methods: {}
}
</script>

<style lang="stylus" scoped>
.editor, .editor-title
  background-color editor-bc

.editor-title
  width 100%
  padding 5px 10px
  border none
  font-size 24px
  font-weight 500

  &:focus
    border none
    outline none

.el-main
  display flex

.editor-wrapper
  flex 1
  height 100%
  width 100%

  & textarea
    padding 10px
    width 100%
    height 100%
    border 0
    outline none
    resize none
    background-color #ffffff
    font-size 16px

.preview-wrapper
  flex 1
  display flex

  .pick-line
    border black 1px solid

.tags
  bottom 0px
  width 100%
  height auto
  min-height 20px
  background-color #aaeedd

  ul
    list-style-type none
    display inline

    li
      border 1px
      border-radius 5px
      background-color aqua
      padding-left 10px
      color black
      float left
</style>
