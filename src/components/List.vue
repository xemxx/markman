<template>
  <div>
    <ul>
      <li v-for="item in this.$store.state.note.list" :key="item.id">
        {{ item.name + "(" + item.nums + ")" }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "file",
  created() {
    this.$store.dispatch("note/getList");
  }
};
</script>

<style></style>
