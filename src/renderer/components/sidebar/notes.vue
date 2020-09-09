<template>
  <a-layout>
    <a-layout-header height="auto" class="toolbar">
      <a-button v-show="showNew" type="text" class="new" @click="addNote(bid)"
        >新建笔记</a-button
      >
    </a-layout-header>
    <a-layout-content class="list">
      <a-card
        class="card"
        v-for="item in notes"
        :key="item.id"
        @click="checkoutNote(item.id)"
        @click.right="rightMenu(item.id, item.bid)"
      >
        <template v-slot:title>
          <div class="card-title">{{ item.title }}</div>
        </template>
        <div class="card-content">{{ item.content }}</div>
      </a-card>
    </a-layout-content>
    <a-modal title="移动笔记" v-model:visible="showMove" width="30%">
      <a-select v-model:value="moveCheck">
        <a-select-option
          v-for="item in notebooks"
          :key="item.guid"
          :value="item.guid"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <template v-slot:footer>
        <a-button key="back" @click="showMove = false">取 消</a-button>
        <a-button key="submit" type="primary" @click="doMove">确 定</a-button>
      </template>
    </a-modal>
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

.card-title
  margin -6px 0

.card-content
  font-size 14px
  max-height 50px
  margin -10px
  overflow hidden

.toolbar
  background-color #ffffff
  text-align center
</style>
