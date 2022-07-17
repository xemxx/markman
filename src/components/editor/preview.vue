<template>
  <div v-html="preview" id="preview"></div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'

// import 'prismjs/themes/prism.css'
import '@/assets/theme/default/default.styl'
import 'highlight.js/styles/atom-one-dark.css'

export default {
  name: 'Preview',
  props: {
    markdown: String,
  },
  computed: {
    preview: function () {
      return marked(this.markdown)
    },
  },
  created() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      highlight: function (code) {
        try {
          return hljs.highlightAuto(code).value
        } catch (err) {
          return code
        }
      },
      langPrefix: 'hljs ',
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false,
    })
  },
}
</script>
