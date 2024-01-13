<template>
  <div ref="markdownRef"></div>
</template>

<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { emitter } from '@/emitter'
import { nextTick, onUnmounted, ref } from 'vue'
import { useEditorStore } from '@/store/editor'
import { Modal } from 'ant-design-vue'
const editor = useEditorStore()

let vditor: Vditor
const props = defineProps({
  markdown: {
    type: String,
    default: function () {
      return ''
    },
  },
})

// listen for checkout a new note.
const setMarkdownToEditor = ({ markdown = '' }: any) => {
  if (vditor) {
    vditor.setValue(markdown)
  }
}

const showCloseQuery = (id: any) => {
  Modal.confirm({
    content: '当前笔记改动是否保存？',
    title: '提示',
    okText: '是',
    cancelText: '否',
    onOk: async () => {
      await editor.saveNote()
      return await editor.loadNote(id)
    },
    onCancel: () => {
      return
    },
  })
}

const markdownRef = ref()

nextTick(() => {
  // listen for emitter events.
  emitter.on('note-loaded', setMarkdownToEditor)
  emitter.on('query-close-note', showCloseQuery)

  const options: IOptions = {
    value: props.markdown,
    height: '100%',
    width: '100%',
    toolbarConfig: {
      hide: false,
      pin: false,
    },
    tab: '\t',
    counter: {
      enable: true,
      type: 'markdown',
    },
    typewriterMode: false,
    cache: { enable: false },
    input: value => {
      editor.listenContentChange({
        markdown: value,
        title: undefined,
      })
    },
  }
  vditor = new Vditor(markdownRef.value, options)
})

onUnmounted(() => {
  emitter.off('note-loaded', setMarkdownToEditor)
  emitter.off('query-close-note', showCloseQuery)

  vditor.destroy()
})
</script>

<style lang="stylus" scope></style>
