<template>
  <div ref="markdown" class="markdown-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ipcRenderer } from 'electron'
export default {
  name: 'editor',
  props: {
    markdown: {
      type: String,
      default: function() {
        return ''
      }
    }
  },
  watch: {
    markdown: function(newVal) {
      if (this.content != newVal) this.monacoEditor.setValue(newVal)
    }
  },
  mounted() {
    this.monacoEditor = monaco.editor.create(this.$refs.markdown, {
      value: this.markdown,
      language: 'markdown',
      formatOnPaste: true,
      lineNumbers: 'on',
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on'
    })
    this.monacoEditor.onDidChangeModelContent(() => {
      let changeContent = this.monacoEditor.getValue()
      this.content = changeContent
      const { commit, dispatch } = this.$store
      commit('editor/update_markdown', changeContent)
      dispatch('editor/handleAutoSave')
    })
    this.listen()
  },
  methods: {
    listen() {
      //fix: mocano-editor大小不自动变化问题
      ipcRenderer.on('m::resize-editor', () => {
        if (!this.$store.state.preview) this.monacoEditor.layout('100%')
      })
    }
  }
}
</script>

<style lang="stylus">
.markdown-editor
  flex 1
  position relative
  overflow hidden
  display block
</style>
