<template>
  <a-layout>
    <a-layout-header height="auto" class="toolbar">
      <transition name="a-zoom-in-top">
        <a-button v-show="showNew" type="text" class="new" @click="addNote(bid)"
          >新建笔记</a-button
        >
      </transition>
    </a-layout-header>
    <a-layout-content class="list">
      <div
        class="a-card is-hover-shadow card"
        shadow="hover"
        v-for="item in notes"
        :key="item.id"
        @click="checkoutNote(item.id)"
        @click.right="rightMenu(item.id, item.bid)"
      >
        <div class="a-card__header">
          {{ item.title }}
        </div>
        <div class="a-card__body">{{ item.content }}</div>
      </div>
    </a-layout-content>
    <a-dialog title="提示" :visible="showMove" width="30%">
      <a-select v-model:value="moveCheck">
        <a-option
          v-for="item in notebooks"
          :key="item.guid"
          :label="item.name"
          :value="item.guid"
        >
        </a-option>
      </a-select>
      <template v-slot:footer class="dialog-footer">
        <a-button @click="showMove = false">取 消</a-button>
        <a-button type="primary" @click="doMove">确 定</a-button>
      </template>
    </a-dialog>
  </a-layout>
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
      moveCheck: 0,
    }
  },
  computed: {
    ...mapState({
      notes: state => state.sidebar.notes,
      showNew: state => state.sidebar.type == 'note',
      bid: state => state.sidebar.flagId,
      notebooks: state => state.sidebar.notebooks,
    }),
  },
  created() {
    this.loadList({ type: 'all' })
  },
  methods: {
    ...mapActions({
      checkoutNote: 'editor/checkoutNote',
      loadList: 'sidebar/loadNotes',
      addNote: 'editor/addNote',
      deleteNote: 'editor/deleteNote',
    }),
    //右键菜单
    rightMenu(id, bid) {
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '移动',
          click: () => this.moveNote(id, bid),
        }),
      )
      menu.append(
        new MenuItem({
          label: '删除',
          click: () => this.deleteNote(id),
        }),
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
        bid: this.moveCheck,
      })
      this.showMove = false
    },
  },
}
</script>

<style lang="stylus" scoped>
.list
  &::-webkit-scrollbar
    width 10px

  &::-webkit-scrollbar-thumb
    -webkit-box-shadow inset 0 0 5px rgba(0, 0, 0, 0.2)
    background #535353

  &::-webkit-scrollbar-track
    -webkit-box-shadow inset 0 0 5px rgba(0, 0, 0, 0.2)
    background #EDEDED

.card
  margin 5px

.a-card__body
  font-size 14px
  max-height 50px

.toolbar
  background-color #ffffff
  text-align center
</style>
