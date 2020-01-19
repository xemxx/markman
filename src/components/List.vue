<template>
  <div class="list">
    <ul>
      <li
        v-for="item in this.$store.state.list.data"
        :key="item.id"
        @click="this.$store.dispatch('note/showDetail',{id:item.id})"
      >{{ item.name + "(" + item.nums + ")" }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "list",
  created() {
    this.$store.dispatch("list/showList");
  }
};
</script>

<style lang="stylus" scoped>
.list {
  height: 100vh;
  background-color: rgb(238, 224, 224);
}
</style>
