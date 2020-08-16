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
        @click="checkoutNote(item.id)"
        @click.right="rightMenu(item.id, item.bid)"
      >
        <div class="el-card__header">
          {{ item.title }}
        </div>
        <div class="el-card__body">{{ item.content }}</div>
      </div>
    </el-main>
    <el-dialog title="提示" :visible.sync="showMove" width="30%">
      <el-select v-model="moveCheck">
        <el-option
          v-for="item in notebooks"
          :key="item.guid"
          :label="item.name"
          :value="item.guid"
        >
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showMove = false">取 消</el-button>
        <el-button type="primary" @click="doMove">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { remote } from 'electron'
const { Menu, MenuItem } = remote

export default {
  name: 'Notes',
  data() {
    return {
      showMove: false,
      moveCheck: 0
    }
  },
  computed: {
    ...mapState({
      notes: state => state.sidebar.notes,
      showNew: state => state.sidebar.type == 'note',
      bid: state => state.sidebar.flagId,
      notebooks: state => state.sidebar.notebooks
    })
  },
  created() {
    this.loadList({ type: 'all' })
  },
  methods: {
    ...mapActions({
      checkoutNote: 'editor/checkoutNote',
      loadList: 'sidebar/loadNotes',
      addNote: 'editor/addNote',
      deleteNote: 'editor/deleteNote'
    }),
    //右键菜单
    rightMenu(id, bid) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '移动',
          click: () => this.moveNote(id, bid)
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
    moveNote(id, bid) {
      this.moveNoteId = id
      this.moveCheck = bid
      this.showMove = true
    },
    doMove() {
      this.$store.dispatch('sidebar/moveNote', {
        id: this.moveNoteId,
        bid: this.moveCheck
      })
      this.showMove = false
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
