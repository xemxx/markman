<template>
  <section
    class="ps-container"
    @ps-scroll-y="scrollHandle"
    @ps-scroll-x="scrollHandle"
    @ps-scroll-up="scrollHandle"
    @ps-scroll-down="scrollHandle"
    @ps-scroll-left="scrollHandle"
    @ps-scroll-right="scrollHandle"
    @ps-y-reach-start="scrollHandle"
    @ps-y-reach-end="scrollHandle"
    @ps-x-reach-start="scrollHandle"
    @ps-x-reach-end="scrollHandle"
  >
    <slot></slot>
  </section>
</template>
<script>
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
import { nextTick } from 'vue'
export default {
  name: 'vue-custom-scrollbar',
  props: {
    settings: {
      default: null,
    },
    swicher: {
      type: Boolean,
      default: true,
    },
    tagname: {
      type: String,
      default: 'section',
    },
  },
  data() {
    return {
      ps: null,
    }
  },
  methods: {
    scrollHandle(evt) {
      this.$emit(evt.type, evt)
    },
    update() {
      if (this.ps) {
        this.ps.update()
      }
    },
    __init() {
      if (this.swicher) {
        if (!this._ps_inited) {
          this._ps_inited = true
          this.ps = new PerfectScrollbar(this.$el, this.settings)
        } else {
          this.ps.update()
        }
      }
    },
    __uninit() {
      if (this.ps) {
        this.ps.destroy()
        this.ps = null
        this._ps_inited = false
      }
    },
  },
  watch: {
    swicher(val) {
      if (val && !this._ps_inited) {
        this.__init()
      }
      if (!val && this._ps_inited) {
        this.__uninit()
      }
    },
    settings: {
      deep: true,
      handler() {
        this.__uninit()
        this.__init()
      },
    },
    $route() {
      this.update()
    },
  },
  mounted() {
    this.__init()
  },
  updated() {
    nextTick(() => this.update())
  },
  beforeUnmount() {
    this.__uninit()
  },
}
</script>

<style lang="stylus">
.ps-container
  position relative
  height 100%
</style>
