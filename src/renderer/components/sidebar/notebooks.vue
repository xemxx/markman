<template>
  <el-container>
    <el-main>
      <el-menu ref="menu" :collapse="isCollapse" class="menu">
        <el-menu-item index="1" @click="loadList({ type: 'all' })"
          >所有笔记</el-menu-item
        >
        <el-submenu index="2">
          <template slot="title">
            笔记本
            <i class="el-icon-plus" @click.stop="showAddNotebook"></i>
          </template>
          <el-menu-item v-show="notebookInput" index="1-new">
            <input
              ref="notebookInput"
              v-model="notebookName"
              @keyup.enter="doAddNotebook"
              @blur="blurAddNotebook"
            />
          </el-menu-item>
          <el-menu-item
            v-for="item in notebooks"
            :key="item.id"
            :index="item.id + ''"
            @click="loadList({ type: 'note', flagId: item.guid })"
          >
            <div class="notebook-item" @click.right="rightMenu(item.id)">
              <span v-if="!item.rename">{{ item.name }} </span>
              <input
                ref="renameInput"
                v-if="item.rename"
                v-model="notebookName"
                @blur="blurRenameNotebook(item.id)"
                @keyup.enter="doRenameNotebook(item.id)"
              />
            </div>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-main>
    <el-footer height="auto">
      <Footer />
    </el-footer>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

import Footer from './footer.vue'

export default {
  name: 'Notebooks',
  data: function() {
    return {
      notebookInput: false,
      notebookName: '',
      isCollapse: false
    }
  },
  computed: {
    ...mapState({
      notebooks: state => {
        return state.sidebar.notebooks
      }
    })
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.loadNotebooks()
  },
  components: {
    Footer
  },
  methods: {
    ...mapActions({
      loadList: 'sidebar/loadNotes',
      loadNotebooks: 'sidebar/loadNotebooks',
      addNotebook: 'sidebar/addNotebook',
      deleteNotebook: 'sidebar/deleteNotebook',
      updateNotebook: 'sidebar/updateNotebook'
    }),
    showAddNotebook() {
      this.$refs['menu'].open(2)
      this.notebookInput = true
      this.$nextTick(() => {
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
      this.$refs['menu'].close(2)
      this.notebookInput = false
      this.notebookName = ''
    },
    //右键菜单
    rightMenu(id) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '重命名',
          click: () => this.renameNotebook(id)
        })
      )
      menu.append(
        new MenuItem({
          label: '删除',
          click: () => this.deleteNotebook(id)
        })
      )
      menu.popup({ window: remote.getCurrentWindow() })
    },
    renameNotebook(id) {
      let index = this.notebooks.findIndex(item => id === item.id)
      this.notebooks[index].rename = true
      this.notebookName = this.notebooks[index].name
      this.renameOld = this.notebooks[index].name
      this.$nextTick(() => {
        console.log(this.$refs)
        this.$refs.renameInput[0].focus()
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
    }
  }
}
</script>
<style lang="stylus" scoped>
.menu
  background-color notebooks-bc

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

.el-submenu .el-menu-item
  padding-right 0
  min-width 100px
</style>
