<template>
  <Milkdown class="m-0 size-full min-w-full max-w-full border-none" />
</template>

<script setup lang="ts">
import { useEditorStore } from '@/store'
const editorS = useEditorStore()

import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'

// We have some themes for you to choose
import '@milkdown/crepe/theme/frame.css'

import { watch } from 'vue'
import { replaceAll } from '@milkdown/kit/utils'

useEditor(root => {
  const crepe = new Crepe({
    root,
    defaultValue: '',
    featureConfigs: {
      [Crepe.Feature.CodeMirror]: {},
    },
  }).on(listener => {
    listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
      editorS.updateContent(markdown)
    })
  })
  // TODO:: 修复某些文档加载后无法正常编辑的问题
  watch(
    () => editorS.currentNote,
    v => {
      if (editorS.isLoadNewNote && crepe.editor != undefined) {
        crepe.editor.action(replaceAll(v.content, false))
        editorS.isLoadNewNote = false
      }
    },
  )
  editorS.editor = crepe
  return crepe
})
</script>

<style>
.milkdown .editor {
  padding: 0px 80px;
}
</style>
