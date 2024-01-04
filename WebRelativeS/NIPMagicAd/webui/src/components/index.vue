<template>
  <div>
    这里是主页
  </div>
</template>

<style>
ul{
  list-style-type: none;
}
</style>

<script type="text/babel">
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      checkoutList: 'checkoutList',
      indexstate: 'indexstate'
    })
  },
  methods: {
    ...mapActions({
      changeindexstate: 'changeindexstate'
    })
  }
}
</script>

<style>
  .menus {
    margin: 0;
    padding: 0;
    display: block
  }
  .menu-item {
    padding: 16px;
  }
</style>