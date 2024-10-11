<script setup lang="ts">
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { rootCtx } from '@milkdown/kit/core'

import { useEditorStore } from '@/store'
const model = defineModel({ required: true, type: String })
const editorS = useEditorStore()

import { Crepe } from '@milkdown/crepe'
import { useTemplateRef } from 'vue'
import '@milkdown/crepe/theme/common/style.css'

// We have some themes for you to choose
import '@milkdown/crepe/theme/nord.css'

const editorRootRef = useTemplateRef('editorRoot')
const crepe = new Crepe({
  root: editorRootRef.value,
  defaultValue: model.value,
  featureConfigs: {
    [Crepe.Feature.CodeMirror]: {},
  },
})

onMounted(() => {
  crepe.editor
    .config(ctx => {
      ctx.set(rootCtx, editorRootRef.value)
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) model.value = markdown
      })
    })
    .use(listener)
  crepe.create().then(() => {
    console.log('Editor created')
  })
  editorS.editor = crepe
})

import { onMounted, watch } from 'vue'
import { replaceAll } from '@milkdown/utils'

watch(
  () => model.value,
  v => {
    if (editorS.isLoadNewNote && crepe.editor != undefined) {
      crepe.editor.action(replaceAll(v, true))
      editorS.isLoadNewNote = false
    }
  },
)
</script>

<template>
  <div
    ref="editorRoot"
    class="m-0 size-full min-w-full max-w-full border-none"
  />
</template>

<style>
.milkdown .editor {
  padding: 0px 80px;
}
</style>
