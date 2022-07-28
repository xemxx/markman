<template>
  <a-layout class="editor">
    <a-layout-header height="auto">
      <input v-model="title" class="editor-title" />
    </a-layout-header>
    <a-layout-content class="editor-wrapper">
      <Editor :markdown="markdown" />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import Editor from './editor.vue'
import { ref, computed } from 'vue'
import { useEditorStore } from '@/store/editor'

const editorS = useEditorStore()

const markdown = ref(editorS.currentNote.content)

const title = computed({
  get: function () {
    return editorS.currentNote.title
  },
  set: function (newVal) {
    editorS.listenContentChange({
      title: newVal,
      markdown: undefined,
    })
  },
})
</script>

<style lang="stylus" scoped>
.editor
  flex 1
  min-width 0
  max-width 100%
  padding-top var(--titleBarHeight)

.editor, .editor-title
  background-color var(--editorBgColor)

.editor-title
  width 100%
  padding 5px 10px
  border none
  font-size 24px
  font-weight 500

  &:focus
    border none
    outline none

.editor-wrapper
  display flex
  height 100%
  min-width 150px

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
