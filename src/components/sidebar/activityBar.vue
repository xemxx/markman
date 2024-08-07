<template>
  <a-flex gap="small" vertical justify="space-between">
    <div class="search-wrapper">
      <input
        v-model="searchStr"
        placeholder="搜索所有笔记"
        @keyup.enter="doSearch"
      />
    </div>
    <ScrollBar class="list-wrapper" :settings="scrollSettings">
      <div class="item" @click="loadList({ type: 'all' })">
        所有笔记
        <PlusCircleOutlined @click.stop="showAddBook" />
      </div>
      <div v-if="bookInputShow" key="addBook" class="item">
        <input
          ref="bookInputRef"
          v-model="bookName"
          @keyup.enter="doAddBook"
          @blur="blurAddBook"
        />
      </div>
      <div
        v-for="item in books"
        :key="item.id + ''"
        class="item"
        @click="loadList({ type: 'note', flagId: item.guid })"
        @click.right="rightMenu(item.id)"
      >
        <span v-if="!item.rename">{{ item.name }} </span>
        <input
          v-if="item.rename"
          ref="bookRenameInputRef"
          v-model="bookReName"
          @blur="blurRenameBook(item.id)"
          @keyup.enter="doRenameBook(item.id)"
        />
      </div>
    </ScrollBar>
    <Footer />
  </a-flex>
</template>

<script setup lang="ts">
import { nextTick, computed, ref } from 'vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { useSidebarStore } from '@/store/sidebar'
import Footer from './footer.vue'
import ScrollBar from '@/components/common/scrollBar.vue'

const { Menu, MenuItem, getCurrentWindow } = window.require('@electron/remote')

// load store
const sidebar = useSidebarStore()

const loadList = sidebar.loadNotes
sidebar.loadNotebooks()

// add book
const bookInputShow = ref(false)
const bookInputRef = ref()
const bookName = ref('')
const showAddBook = () => {
  bookInputShow.value = true
  nextTick(() => {
    bookInputRef.value.focus()
  })
}
const blurAddBook = () => {
  bookInputShow.value = false
  bookName.value = ''
}
const doAddBook = () => {
  const name = bookName.value
  if (name == '') {
    blurAddBook()
  } else {
    // 添加到本地数据库和显示列表
    sidebar.addNotebook(name).then(() => {
      blurAddBook()
    })
  }
}

// rename book
const books = computed(() => sidebar.notebooks)
const bookRenameInputRef = ref()
const bookReName = ref('')
const renameOld = ref('')

const renameBook = id => {
  let index = books.value.findIndex(item => id === item.id)
  books.value[index].rename = true
  bookReName.value = books.value[index].name
  renameOld.value = books.value[index].name
  nextTick(() => {
    if (bookRenameInputRef.value) {
      bookRenameInputRef.value.focus()
    }
  })
}
const doRenameBook = id => {
  if (bookReName.value != '' && bookReName.value != renameOld.value) {
    console.log(bookReName.value)
    sidebar.updateNotebook({ id, name: bookReName.value })
  }
  blurRenameBook(id)
}
const blurRenameBook = id => {
  let index = books.value.findIndex(item => id === item.id)
  books.value[index].rename = false
  bookReName.value = ''
}

// rightMenu
const rightMenu = id => {
  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: '重命名',
      click: () => renameBook(id),
    }),
  )
  menu.append(
    new MenuItem({
      label: '删除',
      click: () => sidebar.deleteNotebook(id),
    }),
  )
  menu.popup({ window: getCurrentWindow() })
}

const scrollSettings = ref({
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
})

// search
const searchStr = ref('')
const doSearch = () => {
  //TODO: 搜索笔记
  console.log(searchStr.value)
  sidebar.searchNotes(searchStr.value)
}
</script>
<style lang="stylus" scoped>
.search-wrapper
  padding 5px 0
  line-height 24px
  border-bottom 1px solid #fff
  background-color transparent

  & input
    padding 0 10px

.list-wrapper
  background-color transparent

.add
  display flex
  position relative
  border-radius 50px
  justify-items center

.item
  font-size 16px
  padding 5px 10px

input
  width 90%
  font-size 14px

  &:focus
    border 0
    outline none
</style>
