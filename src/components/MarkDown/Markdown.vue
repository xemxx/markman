<template>
  <div ref="wrapRef"></div>
</template>
<script lang="ts" setup>
import type { Ref } from 'vue'
import {
  ref,
  unref,
  nextTick,
  computed,
  watch,
  onBeforeUnmount,
  onDeactivated,
} from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { onMountedOrActivated } from '@/hooks'
import { getTheme } from './getTheme'
import { useEditorStore } from '@/store'

type Lang = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' | undefined

const props = defineProps({
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  value: { type: String, default: '' },
})

const emit = defineEmits(['change'])
const editorS = useEditorStore()

const wrapRef = ref(null)
const vditorRef = ref(null) as Ref<Vditor | null>

// 当传入的内容变更时，无条件变更，但是当内部进行修改时，外部不应该改变这个内容
watch(
  () => props.value,
  v => {
    if (v != vditorRef.value?.getValue()) vditorRef.value?.setValue(v)
  },
)

const getCurrentLang = computed((): 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' => {
  let lang: Lang
  lang = 'zh_CN'
  return lang
})

const theme = 'light'

function init() {
  const wrapEl = unref(wrapRef)
  if (!wrapEl) return
  const insEditor = new Vditor(wrapEl, {
    // 设置外观主题
    theme: getTheme(theme) as any,
    lang: unref(getCurrentLang),
    mode: 'wysiwyg',
    undoDelay: 100,
    fullscreen: {
      index: 520,
    },
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
      'code-theme',
      'preview',
      'outline',
    ],
    counter: {
      enable: true,
      type: 'markdown',
    },
    preview: {
      theme: {
        // 设置内容主题
        current: getTheme(theme, 'content'),
      },
      hljs: {
        // 设置代码块主题
        style: getTheme(theme, 'code'),
      },
      actions: [],
    },
    input: v => {
      emit('change', v)
    },
    after: () => {
      nextTick(() => {
        insEditor.setValue(props.value)
        vditorRef.value = insEditor
        editorS.vidtor = insEditor
      })
    },
    blur: () => {},
    height: props.height,
    width: props.width,
    cache: {
      enable: false,
    },
  })
}

function destroy() {
  const vditorInstance = unref(vditorRef)
  if (!vditorInstance) return
  try {
    vditorInstance?.destroy?.()
  } catch (error) {
    //
  }
  vditorRef.value = null
}

onMountedOrActivated(init)

onBeforeUnmount(destroy)
onDeactivated(destroy)
</script>

<style lang="stylus" scoped></style>
