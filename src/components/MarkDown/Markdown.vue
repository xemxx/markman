<template>
  <div ref="wrapRef" class="con"></div>
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
  useAttrs,
} from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { onMountedOrActivated } from '@/hooks'
import { getTheme } from './getTheme'

type Lang = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' | undefined

const props = defineProps({
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  value: { type: String, default: '' },
})

const emit = defineEmits(['change', 'get', 'update:value'])

const attrs = useAttrs()

const wrapRef = ref(null)
const vditorRef = ref(null) as Ref<Vditor | null>
const initedRef = ref(false)

const valueRef = ref(props.value || '')

watch(
  () => props.value,
  v => {
    if (v !== valueRef.value) {
      instance.getVditor()?.setValue(v)
    }
    valueRef.value = v
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
  const bindValue = { ...attrs, ...props }
  const insEditor = new Vditor(wrapEl, {
    // 设置外观主题
    theme: getTheme(theme) as any,
    lang: unref(getCurrentLang),
    mode: 'wysiwyg',
    fullscreen: {
      index: 520,
    },
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
      valueRef.value = v
      emit('update:value', v)
      emit('change', v)
    },
    after: () => {
      nextTick(() => {
        insEditor.setValue(valueRef.value)
        vditorRef.value = insEditor
        initedRef.value = true
        emit('get', instance)
      })
    },
    blur: () => {
      // unref(vditorRef)?.setValue(props.value);
    },
    ...bindValue,
    cache: {
      enable: false,
    },
  })
}

const instance = {
  getVditor: (): Vditor => vditorRef.value!,
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
  initedRef.value = false
}

onMountedOrActivated(init)

onBeforeUnmount(destroy)
onDeactivated(destroy)
</script>

<style lang="stylus" scoped>
.con
  position relative
</style>
