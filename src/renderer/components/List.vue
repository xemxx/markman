<template>
  <el-container>
    <el-header height="auto" class="toolbar">
      <transition name="el-zoom-in-top">
        <el-button
          v-show="showNew"
          type="text"
          class="new"
          @click="addNote(bid)"
          >新建笔记</el-button
        >
      </transition>
    </el-header>
    <el-main class="list">
      <div
        class="el-card is-hover-shadow card"
        shadow="hover"
        v-for="item in notes"
        :key="item.id"
        @click="loadNote(item.id)"
        @click.right="rightMenu(item.id)"
      >
        <div class="el-card__header">
          {{ item.title }}
        </div>
        <div class="el-card__body">{{ item.content }}</div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

export default {
  name: 'list',
  computed: {
    ...mapState({
      notes: state => state.list.notes,
      showNew: state => state.list.type == 'note',
      bid: state => state.list.flagId
    })
  },
  created() {
    this.loadList({ type: 'all' })
  },
  methods: {
    ...mapActions({
      loadNote: 'editor/loadNote',
      loadList: 'list/flash',
      addNote: 'editor/addNote',
      deleteNote: 'editor/deleteNote'
    }),
    //右键菜单
    rightMenu(id) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '移动',
          click: () => this.moveNote(id)
        })
      )
      menu.append(
        new MenuItem({
          label: '删除',
          click: () => this.deleteNote(id)
        })
      )
      menu.popup({ window: remote.getCurrentWindow() })
    },
    //TODO: 移动到新笔记本
    moveNote(id) {
      console.log(id)
    }
  }
}
</script>

<style lang="stylus" scoped>
.list
  overflow-y auto

.card
  margin 5px

.el-card__body
  font-size 14px
  max-height 50px

.toolbar
  background-color #ffffff
  text-align center
</style>
