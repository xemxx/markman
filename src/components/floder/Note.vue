<template>
  <div class="notes">
    <!-- <List header="Header" footer="Footer" border>
      <ListItem v-for="item in floders" :key="item.id">{{ item.name+'('+item.nums+')'}}</ListItem>
    </List>-->
    <ul>
      <li
        v-for="item in floders"
        :key="item.id"
        @click="$emit('load-article',item.id)"
      >{{ item.name+'('+item.nums+')'}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "note",
  props: ["floders"]
};
</script>

<style lang="scss" scoped>
.notes {
  background-color: white;
}
</style>