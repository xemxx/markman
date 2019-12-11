<template>
  <div class="floder">
    <Collapse simple :style="{ height: '100vh' }" v-model="panel">
      <Panel name="favorite">
        收藏夹
        <div slot="content"></div>
      </Panel>
      <Panel name="floder">
        笔记本
        <span class="add" @click.stop="addNotebook">
          <Icon type="ios-add-circle-outline" size="30" />
        </span>
        <div slot="content" class="note">
          <ul>
            <li v-show="notebookInput">
              <Input
                ref="notebookInput"
                v-model="notebookName"
                @on-enter="doAddNotebook"
                @on-blur="blurAddNotebook"
                size="small"
                placeholder="small size"
              />
            </li>
            <li
              v-for="item in this.$store.state.notebook.notebooks"
              :key="item.id"
              @click="$"
            >
              {{ item.name + "(" + item.nums + ")" }}
            </li>
          </ul>
        </div>
      </Panel>
      <Panel name="tag">
        标签
        <div slot="content">
          <Tag />
        </div>
      </Panel>
      <div class="toolbar">
        <p v-if="this.$store.state.sync.isSyncing">
          syncing
        </p>
        <p v-else>
          sync finish
        </p>
      </div>
    </Collapse>
  </div>
</template>

<script>
import { remote } from "electron";
const { Menu, MenuItem } = remote;

export default {
  name: "floder",
  data: function() {
    return {
      panel: "floder",
      notebookInput: false,
      notebookName: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //只从本地获取文章，同步交给同步state处理
      this.$store.dispatch("notebook/getNotebooks");
      //TODO 考虑添加右键菜单，方便操作 优先级较低
      //this.createMenu();
    },
    addNotebook() {
      this.panel = "floder";
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
        this.$store.dispatch("notebook/addNotebook", name);
      }
    },
    blurAddNotebook() {
      this.notebookInput = false;
      this.notebookName = "";
    },
    createMenu() {
      //TODO:完善各个菜单项的右键菜单渲染
      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: "新建记事本",
          click: () => this.addFloder()
        })
      );
      menu.append(new MenuItem({ type: "separator" })); //分割线
      window.addEventListener(
        "contextmenu",
        e => {
          e.preventDefault();
          menu.popup({ window: remote.getCurrentWindow() });
        },
        false
      );
    }
  }
};
</script>

<style lang="scss" scope>
.floder {
  height: 100vh;
}
.note {
  & ul {
    list-style-type: none;
  }
}
.add {
  display: flex;
  position: relative;
  float: right;
  right: 10px;
  border-radius: 50px;
  justify-items: center;
}
.toolbar {
  position: absolute;
  background-color: wheat;
  color: black;
  bottom: 0px;
  width: 100%;
  text-align: center;
}
</style>
