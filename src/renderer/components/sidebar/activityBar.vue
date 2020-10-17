<template>
  <a-layout>
    <a-layout-header class="search-wrapper">
      <input
        v-model="searchStr"
        @keyup.enter="doSearch"
        placeholder="搜索所有笔记"
      />
    </a-layout-header>
    <a-layout-content class="list-wrapper">
      <div class="item" @click="loadList({ type: 'all' })">
        所有笔记 <PlusCircleOutlined @click.stop="showAddBook" />
      </div>
      <div class="item" v-if="bookInputShow" key="addBook">
        <input
          ref="bookInputRef"
          v-model="bookName"
          @keyup.enter="doAddBook"
          @blur="blurAddBook"
        />
      </div>
      <div
        class="item"
        v-for="item in books"
        :key="item.id + ''"
        @click="loadList({ type: 'note', flagId: item.guid })"
        @click.right="rightMenu(item.id)"
      >
        <span v-if="!item.rename">{{ item.name }} </span>
        <input
          v-else
          ref="renameBookInputRef"
          v-model="bookName"
          @blur="blurRenameBook(item.id)"
          @keyup.enter="doRenameBook(item.id)"
        />
      </div>
    </a-layout-content>
    <Footer />
  </a-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { nextTick, computed, ref } from 'vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

import Footer from './footer.vue'

export default {
  setup() {
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
        this.addBook(name).then(() => {
          blurAddBook()
        })
      }
    }

    // rename book
    computed({
      ...mapState({
        books: state => state.sidebar.books,
      }),
    })
    const bookRenameInputRef = ref()

    const renameBook = id => {
      let index = this.books.findIndex(item => id === item.id)
      this.books[index].rename = true
      this.bookName = this.books[index].name
      this.renameOld = this.books[index].name
      nextTick(() => {
        bookRenameInputRef.value.focus()
      })
    }
    const doRenameBook = id => {
      if (this.bookName != '' && this.bookName != this.renameOld) {
        this.updateBook({ id, name: this.bookName })
      }
      blurRenameBook(id)
    }
    const blurRenameBook = id => {
      let index = this.books.findIndex(item => id === item.id)
      this.books[index].rename = false
      this.bookName = ''
    }

    return {
      bookInputShow,
      bookInputRef,
      bookName,

      showAddBook,
      doAddBook,
      blurAddBook,

      bookRenameInputRef,

      renameBook,
      doRenameBook,
      blurRenameBook,
    }
  },

  data() {
    return {
      searchStr: '',
    }
  },
  computed: {
    ...mapState({
      books: state => {
        return state.sidebar.notebooks
      },
    }),
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.loadBooks()
  },
  components: {
    PlusCircleOutlined,
    Footer,
  },
  methods: {
    ...mapActions({
      loadList: 'sidebar/loadNotes',
      loadBooks: 'sidebar/loadNotebooks',
      addBook: 'sidebar/addNoteook',
      deleteBook: 'sidebar/deleteNotebook',
      updateBook: 'sidebar/updateNotebook',
    }),
    //右键菜单
    rightMenu(id) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '重命名',
          click: () => this.renameBook(id),
        }),
      )
      menu.append(
        new MenuItem({
          label: '删除',
          click: () => this.deleteBook(id),
        }),
      )
      menu.popup({ window: remote.getCurrentWindow() })
    },
    doSearch() {
      const { searchStr } = this
      //TODO: 搜索笔记
      console.log(searchStr)
    },
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
