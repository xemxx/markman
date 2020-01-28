<template>
  <el-container class="editor">
    <el-header height="auto">
      <input v-model="title" class="editor-title" />
    </el-header>
    <el-main>
      <div class="editor-wrapper">
        <textarea v-model="markdown"></textarea>
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

export default {
  name: 'editor',
  data() {
    return {
      isModify: false,
      editor: null
    }
  },
  computed: {
    ...mapState({
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
  methods: {}
}
</script>

<style lang="stylus" scoped>
.editor, .editor-title {
  background-color: editor-bc;
}

.editor {
  padding: 0 10px;
}

.editor-title {
  width: 100%;
  padding: 5px 0;
  border: none;
  font-size: 24px;
  font-weight: 500;

  &:focus {
    border: none;
    outline: none;
  }
}

.editor-wrapper {
  height: 100%;
  width: 100%;
  padding: 6px 0;

  & textarea {
    outline-offset: 0px;
    width: 100%;
    height: 100%;
    border: 0;
    outline: none;
    resize: none;
    background-color: #ffffff;
    font-size: 16px;
  }
}

.tags {
  bottom: 0px;
  width: 100%;
  height: auto;
  min-height: 20px;
  background-color: rgb(25, 118, 211);

  ul {
    list-style-type: none;
    display: inline;

    li {
      border: 1px;
      border-radius: 5px;
      background-color: aqua;
      padding-left: 10px;
      color: black;
      float: left;
    }
  }
}
</style>
