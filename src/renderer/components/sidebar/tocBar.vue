<template>
  <a-layout>
    <a-layout-header class="toolbar">
      <div>
        <AlignLeftOutlined />
      </div>
      <div @click="addNote(bid)">
        <PlusOutlined />
      </div>
    </a-layout-header>
    <a-layout-content>
      <ScrollBar class="list" :settings="scrollSettings">
        <div class="card" v-for="item in notes" :key="item.id" @click="checkoutNote(item.id)"
          @click.right="rightMenu(item.id, item.bid)">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-content">
            <p>{{ item.content }}</p>
          </div>
          <hr />
        </div>
      </ScrollBar>
    </a-layout-content>
    <a-modal title="移动笔记" :visible="showMove" width="30%">
      <a-select v-model:value="moveCheck">
        <a-select-option v-for="item in notebooks" :key="item.guid" v-model:value="item.guid">
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
import ScrollBar from '@/components/common/scrollBar'
import { AlignLeftOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Menu, MenuItem, getCurrentWindow } from '@electron/remote'

export default {
  name: 'TocBar',
  components: {
    ScrollBar,
    AlignLeftOutlined,
    PlusOutlined,
  },
  data() {
    return {
      showMove: false,
      moveCheck: 0,
      scrollSettings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
    }
  },
  computed: {
    ...mapState({
      notes: state => state.sidebar.notes,
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
      menu.popup({ window: getCurrentWindow() })
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
  height 100%
  padding 5px

.card
  line-height 1.5715
  background-color transparent
  margin 0

.card-title
  margin 0
  padding 8px 12px
  font-size 16px
  line-height 24px
  font-weight 500
  white-space nowrap
  overflow hidden
  text-overflow ellipsis

.card-content
  font-size 14px
  height 46px
  margin 0
  padding 0 12px 5px 12px
  overflow hidden
  text-overflow ellipsis

.toolbar
  background-color transparent
  text-align center
  display flex
  justify-content space-between
  padding 0 10px
  line-height 14px
</style>
