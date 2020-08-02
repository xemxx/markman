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
          type: 'text'
        },
        cache: { enable: false },
        input: value => {
          const { dispatch } = this.$store
          dispatch('editor/listenContentChange', {
            content: value
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
    }
  }
}
</script>

<style lang="stylus" scope="this api replaced by slot-scope in 2.5.0+"></style>
