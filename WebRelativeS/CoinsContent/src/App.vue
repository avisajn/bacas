<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
 data () {
    return {
      // dataimg: require('../public/img/background.jpg')
    }
  },
  created() {
   
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  height: 100%;
  /* margin-top: 60px; */

}
body,html {
  margin: 0px;
  padding: 0px;
  height: 100%;

}
.minWidth{min-width:1300px}
.maxWidth{max-width: 300px;}
</style>
