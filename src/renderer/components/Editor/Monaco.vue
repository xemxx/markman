<template>
  <div ref="markdown" class="markdown-editor"></div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
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
  watch: {
    markdown: function(newVal) {
      if (this.content != newVal) this.monacoEditor.setValue(newVal)
    }
  },
  mounted() {
    // 创建编辑区以及设置编辑选项
    this.monacoEditor = monaco.editor.create(this.$refs.markdown, {
      value: this.markdown,
      language: 'markdown',
      formatOnPaste: true,
      lineNumbers: 'on',
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on'
    })
    // 监听内容改变事件
    this.monacoEditor.onDidChangeModelContent(() => {
      const changeContent = this.monacoEditor.getValue()
      this.content = changeContent //获取改变后的内容更新到本地
      const { commit, dispatch } = this.$store
      commit('editor/update_content', changeContent) // 更新数据到全局
      dispatch('editor/handleAutoSave') // 处理自动保存事件
    })
    this.listen() // 启动单独的监听事件
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
