<template>
  <a-layout>
    <a-layout-header class="toolbar">
      <div>
        <AlignLeftOutlined />
      </div>
      <div @click="addNote(bid)">
        <PlusOutlined />
      </div>
    </a-layout-header>
    <a-layout-content>
      <ScrollBar class="list" :settings="scrollSettings">
        <div
          v-for="item in notes"
          :key="item.id"
          class="card"
          @click="checkoutNote(item.id)"
          @click.right="rightMenu(item.id, item.bid)"
        >
          <div class="card-title">{{ item.title }}</div>
          <div class="card-content">
            <p>{{ item.content }}</p>
          </div>
          <hr />
        </div>
      </ScrollBar>
    </a-layout-content>
    <a-modal title="移动笔记" :visible="showMove" width="30%">
      <a-select v-model:value="moveCheck">
        <a-select-option
          v-for="item in notebooks"
          :key="item.guid"
          v-model:value="item.guid"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <template #footer>
        <a-button key="back" @click="showMove = false">取 消</a-button>
        <a-button key="submit" type="primary" @click="doMove">确 定</a-button>
      </template>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import ScrollBar from '@/components/common/scrollBar.vue'
import { useEditorStore } from '@/store/editor'
import { useSidebarStore } from '@/store/sidebar'
import { AlignLeftOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
const { Menu, MenuItem, getCurrentWindow } = window.require('@electron/remote')

const showMove = ref(false)
const moveCheck = ref(0)

const scrollSettings = ref({
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
})

const sidebar = useSidebarStore()

const { notes, flagId: bid, notebooks } = storeToRefs(sidebar)

const { loadNotes: loadList } = sidebar

const editor = useEditorStore()
const { checkoutNote, addNote, deleteNote } = editor

loadList({ type: 'all' })

//右键菜单
const rightMenu = (id, bid) => {
  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: '移动',
      click: () => moveNote(id, bid),
    }),
  )
  menu.append(
    new MenuItem({
      label: '删除',
      click: () => deleteNote(id),
    }),
  )
  menu.popup({ window: getCurrentWindow() })
}
let moveNoteId = 0

const moveNote = (id, bid) => {
  moveNoteId = id
  moveCheck.value = bid
  showMove.value = true
}
const doMove = () => {
  sidebar.moveNote({
    id: moveNoteId,
    bid: moveCheck.value,
  })
  showMove.value = false
}
</script>

<style lang="stylus" scoped>
.list
  height 100%
  padding 5px

.card
  line-height 1.5715
  background-color transparent
  margin 0

.card-title
  margin 0
  padding 8px 12px
  font-size 16px
  line-height 24px
  font-weight 500
  white-space nowrap
  overflow hidden
  text-overflow ellipsis

.card-content
  font-size 14px
  height 46px
  margin 0
  padding 0 12px 5px 12px
  overflow hidden
  text-overflow ellipsis

.toolbar
  background-color transparent
  text-align center
  display flex
  justify-content space-between
  padding 0 10px
  line-height 14px
</style>
