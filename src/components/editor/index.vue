<template>
  <div id="vditor" class="" />
</template>
<script lang="ts" setup>
import { ref, onMounted, onDeactivated } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
const vditor = ref<Vditor | null>(null)
import { useEditorStore } from '@/store'

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
        current: 'ant-design', // todo 配置自己的主题
      },
    },
    theme: 'classic',
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

function destroy() {
  vditor.value?.destroy()
}

onDeactivated(destroy)
</script>

<style scoped>
.vditor {
  border: none;
}
</style>
