<template>
  <el-container>
    <el-main>
      <el-menu ref="menu" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
        <el-menu-item index="1">所有笔记</el-menu-item>
        <el-submenu index="2">
          <template slot="title">
            笔记本
            <Icon type="ios-add-circle-outline" size="20" @click.stop="showAddNotebook" />
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
            :index="item.id+''"
            @click="showList({type:'note',tid:item.id})"
          >
            <div class="delete_button" @click="deleteNotebook(item.id)">
              {{ item.name }}<i class="el-icon-delete"></i>
            </div>
          </el-menu-item>
        </el-submenu>
        <el-menu-item index="3">Tag</el-menu-item>
      </el-menu>
    </el-main>
    <el-footer class="toolbar" height="auto">
      <p v-if="isSyncing">syncing</p>
      <p v-else>sync finish</p>
    </el-footer>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "floder",
  data: function() {
    return {
      notebookInput: false,
      notebookName: "",
      isCollapse: false
    };
  },
  computed: {
    ...mapState({
      notebooks: state => state.notebook.notebooks,
      isSyncing: state => state.sync.isSyncing
    })
  },
  created() {
    //只从本地获取文章，同步交给同步state处理
    this.flashList;
    //TODO 添加右键菜单，方便修改
    //this.createMenu();
  },
  methods: {
    ...mapActions({
      showList: "list/showList",
      flashList: "notebook/flashList",
      addNotebook: "notebook/addNotebook",
      deleteNotebook: "notebook/deleteNotebook"
    }),
    showAddNotebook() {
      this.$refs["menu"].open(2);
      this.notebookInput = true;
      this.$nextTick(() => {
        this.$refs.notebookInput.focus();
      });
    },
    doAddNotebook() {
      let name = this.notebookName;
      if (name == "") {
        this.blurAddNotebook();
      } else {
        // 添加到本地数据库和显示列表
        this.addNotebook(name).then(() => {
          this.blurAddNotebook();
        });
      }
    },
    blurAddNotebook() {
      this.$refs["menu"].close(2);
      this.notebookInput = false;
      this.notebookName = "";
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>
<style lang="stylus" scoped>
.note {
  & ul {
    list-style-type: none;
  }
}

.add {
  display: flex;
  position: relative;
  border-radius: 50px;
  justify-items: center;
}

.toolbar {
  background-color: wheat;
  color: black;
  text-align: center;
}
</style>
