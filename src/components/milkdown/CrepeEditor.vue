<template>
  <Milkdown class="m-0 size-full border-none" />
</template>

<script setup lang="ts">
import { useEditorStore } from '@/store'
const editorS = useEditorStore()

import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import { emoji } from '@milkdown/plugin-emoji'
import '@milkdown/crepe/theme/common/style.css'

// We have some themes for you to choose
import '@milkdown/crepe/theme/frame.css'

import { watch } from 'vue'
import { replaceAll } from '@milkdown/kit/utils'

useEditor(root => {
  // 创建Crepe编辑器实例
  // 注意: 要禁用斜杠菜单中的图片功能，需要安装并配置@milkdown/plugin-slash
  // 然后可以通过自定义斜杠菜单项来过滤掉图片选项
  const crepe = new Crepe({
    root,
    defaultValue: '',
    featureConfigs: {
      [Crepe.Feature.CodeMirror]: {},
      [Crepe.Feature.BlockEdit]: {
        buildMenu: builder => {
          const advancedGroup = builder.getGroup('advanced')
          // 缓存当前高级组中的所有项目
          const items = [...advancedGroup.group.items]
          // 清空当前组中的所有项目
          advancedGroup.clear()
          // 重新添加除了image以外的所有项目
          items.forEach(item => {
            if (item.key !== 'image') {
              advancedGroup.addItem(item.key, {
                label: item.label,
                icon: item.icon,
                onRun: item.onRun,
              })
            }
          })
        },
      },
    },
  }).on(listener => {
    listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
      if (markdown !== prevMarkdown) {
        editorS.updateContent(markdown)
      }
    })
  })
  crepe.editor.use(emoji)
  // 修复某些文档加载后无法正常编辑的问题，解决办法：固定版本到7.6.2
  watch(
    () => editorS.dbNote,
    v => {
      if (editorS.isLoadNewNote && crepe.editor != undefined) {
        crepe.editor.action(replaceAll(v.content, true))
        editorS.isLoadNewNote = false
      }
    },
  )
  editorS.editor = crepe
  return crepe
})
</script>

<style>
.editor {
  height: 100%;
}
</style>
