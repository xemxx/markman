<template>
  <a-layout>
    <a-layout-content>
      <a-menu ref="menu" mode="inline" class="menu">
        <a-menu-item key="sub1" @click="loadList({ type: 'all' })"
          >所有笔记</a-menu-item
        >
        <a-sub-menu key="sub2">
          <template v-slot:title>
            <span
              ><span>笔记本</span>
              <PlusCircleOutlined @click.stop="showAddNotebook" />
            </span>
          </template>
          <a-menu-item v-if="notebookInput" key="addNotebook">
            <input
              ref="notebookInput"
              :value="notebookName"
              @keyup.enter="doAddNotebook"
              @blur="blurAddNotebook"
            />
          </a-menu-item>
          <a-menu-item
            v-for="item in notebooks"
            :key="item.id + ''"
            @click="loadList({ type: 'note', flagId: item.guid })"
          >
            <div class="notebook-item" @click.right="rightMenu(item.id)">
              <span v-if="!item.rename">{{ item.name }} </span>
              <input
                ref="renameInput"
                v-else
                :value="notebookName"
                @blur="blurRenameNotebook(item.id)"
                @keyup.enter="doRenameNotebook(item.id)"
              />
            </div>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-content>
    <a-layout-footer height="auto">
      <Footer />
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { nextTick } from 'vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

import Footer from './footer.vue'

export default {
  name: 'Notebooks',
  data() {
    return {
      notebookInput: false,
      notebookName: '',
    }
  },
  computed: {
    ...mapState({
      notebooks: state => {
        return state.sidebar.notebooks
      },
    }),
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.loadNotebooks()
  },
  components: {
    Footer,
    PlusCircleOutlined,
  },
  methods: {
    ...mapActions({
      loadList: 'sidebar/loadNotes',
      loadNotebooks: 'sidebar/loadNotebooks',
      addNotebook: 'sidebar/addNotebook',
      deleteNotebook: 'sidebar/deleteNotebook',
      updateNotebook: 'sidebar/updateNotebook',
    }),
    showAddNotebook() {
      this.notebookInput = true
      nextTick(() => {
        this.$refs['notebookInput'].focus()
      })
    },
    doAddNotebook() {
      let name = this.notebookName
      if (name == '') {
        this.blurAddNotebook()
      } else {
        // 添加到本地数据库和显示列表
        this.addNotebook(name).then(() => {
          this.blurAddNotebook()
        })
      }
    },
    blurAddNotebook() {
      this.notebookInput = false
      this.notebookName = ''
    },
    //右键菜单
    rightMenu(id) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '重命名',
          click: () => this.renameNotebook(id),
        }),
      )
      menu.append(
        new MenuItem({
          label: '删除',
          click: () => this.deleteNotebook(id),
        }),
      )
      menu.popup({ window: remote.getCurrentWindow() })
    },
    renameNotebook(id) {
      let index = this.notebooks.findIndex(item => id === item.id)
      this.notebooks[index].rename = true
      this.notebookName = this.notebooks[index].name
      this.renameOld = this.notebooks[index].name
      nextTick(() => {
        this.$refs.renameInput.focus()
      })
    },
    doRenameNotebook(id) {
      if (this.notebookName != '' && this.notebookName != this.renameOld) {
        this.updateNotebook({ id, name: this.notebookName })
      }
      this.blurRenameNotebook(id)
    },
    blurRenameNotebook(id) {
      let index = this.notebooks.findIndex(item => id === item.id)
      this.notebooks[index].rename = false
      this.notebookName = ''
    },
  },
}
</script>
<style lang="stylus" scoped>
.menu
  background-color var(--SiderBarBgColor)
  color var(--SiderBarColor) !important

.add
  display flex
  position relative
  border-radius 50px
  justify-items center

input
  width 90%
  font-size 14px

  &:focus
    border 0
    outline none
</style>
