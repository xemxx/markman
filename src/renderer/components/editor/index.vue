<template>
  <el-container class="editor">
    <el-header height="auto">
      <input v-model="title" class="editor-title" />
    </el-header>
    <el-main>
      <div class="editor-wrapper">
        <Editor :markdown="markdown"></Editor>
      </div>
      <!-- <div class="preview-wrapper" v-if="showPreview">
        <div class="pick-line"></div>
        <preview :markdown="markdown"></preview>
      </div> -->
    </el-main>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import Editor from './editor'

export default {
  data() {
    return {
      modifyState: false,
      editor: null
    }
  },
  computed: {
    ...mapState({
      showPreview: state => state.preference.togglePreview,
      tags: state => state.editor.tags,
      markdown: state => state.editor.currentNote.content,
      isEdit: state => state.editor.isEdit
    }),
    title: {
      get: function() {
        return this.$store.state.editor.currentNote.title
      },
      set: function(newVal) {
        this.$store.commit('editor/update_title', newVal)
        this.$store.dispatch('editor/handleAutoSave')
      }
    }
  },
  methods: {},
  components: {
    Editor
  }
}
</script>

<style lang="stylus" scoped>
.editor
  flex 1

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
  overflow hidden

.editor-wrapper
  display flex
  flex 1
  min-width 150px

.preview-wrapper
  display flex
  flex 1
  min-width 150px

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
