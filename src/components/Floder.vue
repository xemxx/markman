<template>
  <div class="floder">
    <Collapse simple :style="{height:'100vh'}" v-model="panel">
      <Panel name="favorite">
        收藏夹
        <div slot="content">
          <Favorite />
        </div>
      </Panel>
      <Panel name="floder">
        笔记本
        <span class="add" @click.stop="addFloder">
          <Icon type="ios-add-circle-outline" size="30" />
        </span>
        <div slot="content" class="note">
          <ul>
            <li v-show="floderInput">
              <Input
                ref="floderInput"
                v-model="floderName"
                @on-enter="doAddFloder"
                @on-blur="blurAddFloder"
                size="small"
                placeholder="small size"
              />
            </li>
            <li
              v-for="item in floders"
              :key="item.id"
              @click="$emit('load-article',item.id)"
            >{{ item.name+'('+item.nums+')'}}</li>
          </ul>
        </div>
      </Panel>
      <Panel name="tag">
        标签
        <div slot="content">
          <Tag />
        </div>
      </Panel>
    </Collapse>
  </div>
</template>

<script>
import { uuid } from "../tools/function.js";
import { remote } from "electron";
const { Menu, MenuItem } = remote;
import Favorite from "./floder/Favorite";
//import Note from "./floder/Note";
import Tag from "./floder/Tag";

export default {
  name: "floder",
  data: function() {
    return {
      floders: [],
      panel: "floder",
      floderInput: false,
      floderName: ""
    };
  },
  components: {
    Favorite,
    //Note,
    Tag
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //TODO: 获取服务端文章，更新本地文章或者同步服务端文章
      this.floders = [
        { id: 1, name: "linux", nums: 1 },
        { id: 2, name: "macos", nums: 2 }
      ];
      //this.createMenu();
    },
    addFloder() {
      this.panel = "floder";
      this.floderInput = true;
      this.$nextTick(() => {
        this.$refs.floderInput.focus();
      });
    },
    doAddFloder() {
      let name = this.floderName;
      if (name == "") {
        this.blurAddFloder();
      }
      this.$db.queryData(
        "SELECT tbl_name FROM sqlite_master WHERE type = 'table'",
        rows => {
          console.log(JSON.stringify(rows));
        }
      );
      this.$db.insertData(
        "insert into floder (uuid,username,name,sort,sortType) values(?,?,?,?)",
        [[uuid(32, 10), this.$store.user.username, name, 1, 0]]
      );
    },
    blurAddFloder() {
      this.floderInput = false;
      this.floderName = "";
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

<style lang="scss">
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
</style>