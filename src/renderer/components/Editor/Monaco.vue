<template>
  <div ref="markdown" class="markdown-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import bus from '@/bus'
import { ipcRenderer } from 'electron'
export default {
  name: 'Monaco',
  props: {
    markdown: {
      type: String,
      default: function() {
        return ''
      }
    }
  },
  watch: {},
  created() {
    this.$nextTick(() => {
      // listen for bus events.
      bus.$on('note-loaded', this.setMarkdownToEditor)

      // create monaco editor
      this.monacoEditor = monaco.editor.create(this.$refs.markdown, {
        value: this.markdown,
        language: 'markdown',
        formatOnPaste: true,
        lineNumbers: 'on',
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: 'on'
      })
      // listen for monaco editor content changed
      this.monacoEditor.onDidChangeModelContent(() => {
        const changeContent = this.monacoEditor.getValue()
        this.content = changeContent
        const { commit, dispatch } = this.$store
        commit('editor/update_content', changeContent) // 更新数据到全局
        dispatch('editor/handleAutoSave') // 处理自动保存事件
      })
      // listen for main thread ipc message
      this.listen()
    })
  },

  methods: {
    listen() {
      //fix: mocano-editor大小不自动变化问题
      ipcRenderer.on('m::resize-editor', () => {
        if (!this.$store.state.preview) this.monacoEditor.layout('100%')
      })
    },

    // listen for checkout a new note.
    setMarkdownToEditor({ markdown }) {
      const { monacoEditor } = this
      if (monacoEditor) {
        monacoEditor.setValue(markdown)
      }
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
