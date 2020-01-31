<template>
  <el-container>
    <el-main>
      <el-menu
        ref="menu"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse"
        class="menu"
      >
        <el-menu-item index="1" @click="loadList({ type: 'all' })"
          >所有笔记</el-menu-item
        >
        <el-submenu index="2">
          <template slot="title">
            笔记本
            <i class="el-icon-plus" @click.stop="showAddNotebook"></i>
          </template>
          <el-menu-item v-show="notebookInput" index="1-new">
            <Input
              ref="notebookInput"
              v-model="notebookName"
              @on-enter="doAddNotebook"
              @on-blur="blurAddNotebook"
              size="small"
              placeholder="small size"
            />
          </el-menu-item>
          <el-menu-item
            v-for="item in notebooks"
            :key="item.id"
            :index="item.id + ''"
            @click="loadList({ type: 'note', flagId: item.guid })"
          >
            <div class="notebook-item" @click.right="rightMenu">
              {{ item.name }}
              <i
                @click.stop="deleteNotebook(item.id)"
                class="el-icon-delete"
              ></i>
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
      notebooks: state => state.floder.notebooks,
      isSyncing: state => state.sync.isSyncing
    })
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.flashNotebooks
    //TODO 添加右键菜单，方便修改
    //this.createMenu();
  },
  methods: {
    ...mapActions({
      loadList: 'list/flashList',
      flashNotebooks: 'floder/flashList',
      addNotebook: 'floder/addNotebook',
      deleteNotebook: 'floder/deleteNotebook'
    }),
    showAddNotebook() {
      this.$refs['menu'].open(2)
      this.notebookInput = true
      this.$nextTick(() => {
        this.$refs.notebookInput.focus()
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
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    },
    rightMenu() {
      //右键菜单
      //console.log(e);
      //TODO 新建笔记，删除笔记本，重命名笔记本
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '放大',
          click: () => {
            console.log('item 1 clicked')
          }
        })
      )
      menu.append(new MenuItem({ type: 'separator' })) //分割线
      menu.append(
        new MenuItem({ label: '缩小', type: 'checkbox', checked: true })
      ) //选中
      menu.popup({ window: remote.getCurrentWindow() })
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

.toolbar
  background-color wheat
  color black
  text-align center

.el-submenu .el-menu-item
  padding-right 0
</style>
