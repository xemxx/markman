<template>
  <div id="vditor" class="editor-container" />
</template>
<script lang="ts" setup>
import { ref, onMounted, onDeactivated } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
const vditor = ref<Vditor | null>(null)
import { useEditorStore, usePreferenceStore } from '@/store'

const props = defineProps({
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  value: { type: String, default: '' },
})

const emit = defineEmits(['change'])
const editorS = useEditorStore()

onMounted(() => {
  vditor.value = new Vditor('vditor', {
    mode: 'ir',
    undoDelay: 100,
    toolbar: [
      'undo',
      'redo',
      '|',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'insert-after',
      'insert-before',
      '|',
      'upload',
      'table',
      '|',
      'edit-mode',
      'outline',
    ],
    counter: {
      enable: true,
      type: 'markdown',
    },
    preview: {
      theme: {
        current: getPreviewTheme(perfS.themeType), // todo 配置自己的主题
      },
      hljs: {
        style: getCodeTheme(perfS.themeType),
      },
    },
    theme: getTheme(perfS.themeType),
    input: v => {
      emit('change', v)
    },
    height: props.height,
    width: props.width,
    cache: {
      enable: false,
    },
    after: () => {
      // vditor.value is a instance of Vditor now and thus can be safely used here
      vditor.value!.setValue(props.value)
      editorS.vidtor = vditor.value
      vditor.value?.setTheme(
        getTheme(perfS.themeType),
        getPreviewTheme(perfS.themeType),
        getCodeTheme(perfS.themeType),
      )
    },
    link: {
      isOpen: true,
      click: link => {
        let url = ''
        if (vditor.value?.getCurrentMode() === 'ir') {
          url = link.innerHTML
        } else {
          url = link.getAttribute('href') || ''
        }
        window.open(url)
      },
    },
  })
})

import { watch } from 'vue'
watch(
  () => props.value,
  v => {
    if (v != vditor.value?.getValue()) {
      vditor.value?.setValue(v)
      if (editorS.isLoadNewNote) {
        vditor.value!.clearCache()
        vditor.value!.clearStack()
        editorS.isLoadNewNote = false
      }
    }
  },
)

const perfS = usePreferenceStore()

watch(
  () => perfS.themeType,
  v => {
    vditor.value?.setTheme(getTheme(v), getPreviewTheme(v), getCodeTheme(v))
  },
)

function getTheme(v: string) {
  return v === 'dark' ? 'dark' : 'classic'
}

function getCodeTheme(v: string) {
  return v === 'dark' ? 'monokai' : 'github'
}

function getPreviewTheme(v: string) {
  return v === 'dark' ? 'dark' : 'ant-design'
}

function destroy() {
  vditor.value?.destroy()
}

onDeactivated(destroy)
</script>

<style>
/* 移除 scoped 属性，使样式可以全局生效 */
.vditor {
  border: none;
  width: 100% !important;
  max-width: 100% !important;
}

.vditor-reset {
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
}

.vditor-ir {
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
}

.vditor-ir pre.vditor-reset {
  white-space: pre-wrap !important;
  overflow-x: auto !important;
}

.vditor-reset pre {
  white-space: pre-wrap !important;
  max-width: 100% !important;
  overflow-x: auto !important;
}

.vditor-reset code {
  word-break: break-all !important;
  white-space: pre-wrap !important;
}

.vditor-reset table {
  table-layout: fixed !important;
  width: 100% !important;
  max-width: 100% !important;
  display: block !important;
  overflow-x: auto !important;
}

/* 图片最大宽度限制 */
.vditor-reset img {
  max-width: 100% !important;
  height: auto !important;
}

/* 长链接文本换行 */
.vditor-reset a {
  word-break: break-all !important;
  overflow-wrap: break-word !important;
}
</style>
