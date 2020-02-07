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
            <el-input
              ref="notebookInput"
              v-model="notebookName"
              @keyup.enter="doAddNotebook"
              @blur="blurAddNotebook"
            ></el-input>
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
        <el-menu-item index="3" @click="loadList({ type: 'tag' })"
          >Tag</el-menu-item
        >
      </el-menu>
    </el-main>
    <el-footer class="toolbar" height="auto">
      <div style="display:inline-block">
        <p v-if="isSyncing">syncing</p>
        <p v-else>sync finish</p>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

export default {
  name: 'floder',
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
        return state.floder.notebooks.map(item => {
          item.rename = false
          return item
        })
      },
      isSyncing: state => state.sync.isSyncing
    })
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.flashNotebooks()
  },
  methods: {
    ...mapActions({
      loadList: 'list/flashList',
      flashNotebooks: 'floder/flashList',
      addNotebook: 'floder/addNotebook',
      deleteNotebook: 'floder/deleteNotebook',
      updateNotebook: 'floder/updateNotebook'
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
    rightMenu(id) {
      //右键菜单
      //TODO 新建笔记，删除笔记本，重命名笔记本
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
      console.log('n')
      let index = this.notebooks.findIndex(item => id === item.id)
      this.notebooks[index].rename = false
      this.notebookName = ''
    }
  }
}
</script>
<style lang="stylus" scoped>
.menu
  background-color floder-bc

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

.toolbar
  background-color wheat
  color black
  text-align center

.el-submenu .el-menu-item
  padding-right 0
  min-width 100px
</style>
