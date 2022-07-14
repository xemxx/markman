<template>
  <a-layout>
    <a-layout-header class="search-wrapper">
      <input v-model="searchStr" @keyup.enter="doSearch" placeholder="搜索所有笔记" />
    </a-layout-header>
    <a-layout-content class="list-wrapper">
      <div class="item" @click="loadList({ type: 'all' })">
        所有笔记
        <PlusCircleOutlined @click.stop="showAddBook" />
      </div>
      <div class="item" v-if="bookInputShow" key="addBook">
        <input ref="bookInputRef" v-model="bookName" @keyup.enter="doAddBook" @blur="blurAddBook" />
      </div>
      <div class="item" v-for="item in books" :key="item.id + ''" @click="loadList({ type: 'note', flagId: item.guid })"
        @click.right="rightMenu(item.id)">
        <span v-if="!item.rename">{{ item.name }} </span>
        <input v-if="item.rename" ref="bookRenameInputRef" v-model="bookReName" @blur="blurRenameBook(item.id)"
          @keyup.enter="doRenameBook(item.id)" />
      </div>
    </a-layout-content>
    <Footer />
  </a-layout>
</template>

<script>
import { useStore } from 'vuex'
import { nextTick, computed, ref } from 'vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'


import { Menu, MenuItem, getCurrentWindow } from '@electron/remote'

import Footer from './footer.vue'

export default {
  components: {
    PlusCircleOutlined,
    Footer,
  },
  setup() {
    // load store
    const store = useStore()

    const loadList = obj => store.dispatch('sidebar/loadNotes', obj)
    store.dispatch('sidebar/loadNotebooks')

    // add book
    const bookInputShow = ref(false)
    const bookInputRef = ref(null)
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
        store.dispatch('sidebar/addNotebook', name).then(() => {
          blurAddBook()
        })
      }
    }

    // rename book
    const books = computed(() => store.state.sidebar.notebooks)
    const bookRenameInputRef = ref(null)
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
        store.dispatch('sidebar/updateNotebook', { id, name: bookReName.value })
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
          click: () => store.dispatch('sidebar/deleteNotebook', id),
        }),
      )
      menu.popup({ window: getCurrentWindow() })
    }

    // search
    const searchStr = ref('')
    const doSearch = () => {
      //TODO: 搜索笔记
      console.log(searchStr)
    }

    return {
      // store
      books,

      loadList,

      // addBook
      bookInputShow,
      bookInputRef,
      bookName,

      showAddBook,
      doAddBook,
      blurAddBook,

      // renameBook
      bookRenameInputRef,
      bookReName,

      renameBook,
      doRenameBook,
      blurRenameBook,

      // rightMenu
      rightMenu,

      // search
      searchStr,
      doSearch,
    }
  },
}
</script>
<style lang="stylus" scoped>
.search-wrapper
  padding 5px 0
  line-height 24px
  border-bottom 1px solid #fff

  & input
    padding 0 10px

.list-wrapper, .search-wrapper
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
