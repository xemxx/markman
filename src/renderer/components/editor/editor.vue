<template>
  <div ref="markdown"></div>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import bus from '@/bus'

export default {
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
      bus.$on('query-close-note', this.showCloseQuery)

      const options = {
        value: this.markdown,
        height: '100%',
        width: '100%',
        toolbar: [],
        toolbarConfig: {
          hide: false,
          pin: true
        },
        tab: '\t',
        counter: {
          enable: true,
          type: 'md'
        },
        typewriterMode: true,
        cache: { enable: false },
        input: value => {
          const { dispatch } = this.$store
          dispatch('editor/listenContentChange', {
            markdown: value
          })
        }
      }

      this.vditor = new Vditor(this.$refs.markdown, options)

      // listen for main thread ipc message
      this.listen()
    })
  },
  beforeDestroy() {
    bus.$off('note-loaded', this.setMarkdownToEditor)
    bus.$off('query-close-note', this.showCloseQuery)

    this.vditor.destroy()
  },

  methods: {
    listen() {},

    // listen for checkout a new note.
    setMarkdownToEditor({ markdown }) {
      const { vditor } = this
      if (vditor) {
        vditor.setValue(markdown, true)
      }
    },

    showCloseQuery(id) {
      this.$confirm('当前笔记改动是否保存？', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '是',
        cancelButtonText: '否'
      })
        .then(
          () => {
            return this.$store.dispatch('editor/saveNote')
          },
          action => {
            return action
          }
        )
        .then(action => {
          console.log(123)
          if (action == 'cancel' || action == undefined)
            this.$store.dispatch('editor/loadNote', id)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

<style lang="stylus" slot-scope></style>
