<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { nord } from '@milkdown/theme-nord'
import { tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import { usePluginViewFactory } from '@prosemirror-adapter/vue'
import Tooltip from './Tooltip.vue'

import { useEditorStore } from '@/store'
const model = defineModel({ required: true, type: String })
const editorS = useEditorStore()

const pluginViewFactory = usePluginViewFactory()
const tooltip = tooltipFactory('Text')
const edit = useEditor(root => {
  const edit = Editor.make()
    .config(nord)
    .config(ctx => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, model.value)
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) model.value = markdown
      })
      // editorS.editor = ctx.get(rootCtx)
      ctx.set(tooltip.key, {
        view: pluginViewFactory({
          component: Tooltip,
        }),
      })
    })
    .use(listener)
    .use(commonmark)
    .use(tooltip)

  return edit
})

import { watch } from 'vue'
import { replaceAll } from '@milkdown/utils'

watch(
  () => model.value,
  v => {
    if (editorS.isLoadNewNote && edit.get() != undefined) {
      edit.get()?.action(replaceAll(v, false))
      editorS.isLoadNewNote = false
    }
  },
)
</script>

<template>
  <Milkdown
    class="prose prose-invert m-0 flex min-w-full flex-1 overflow-x-hidden"
  />
</template>
