<template>
  <div class="toolbar">
    <div><AlignLeftOutlined /></div>
    <div @click="addNote(bid)"><PlusOutlined /></div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { AlignLeftOutlined, PlusOutlined } from '@ant-design/icons-vue'
export default {
  computed: {
    ...mapState({
      bid: state => state.sidebar.flagId,
    }),
  },
  components: {
    AlignLeftOutlined,
    PlusOutlined,
  },
  methods: {
    ...mapActions({
      addNote: 'editor/addNote',
    }),
  },
}
</script>

<style lang="stylus" scoped>
.toolbar
  display flex
  justify-content space-between
  padding 0 10px
  line-height 14px
</style>
