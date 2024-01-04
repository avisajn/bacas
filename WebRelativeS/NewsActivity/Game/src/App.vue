<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      dataimg: require('../static/loading.jpg')
    }
  },
  created() {
    let _body = document.getElementsByTagName('body')[0];
    _body.style.backgroundImage = "url('" + this.dataimg + "')";
    _body.style.backgroundSize = "100% 100%";
    // _body.style.position = "absolute";
    // _body.style.top = "0";

    document.body.removeChild(document.getElementById('Loading'))
  },
}

</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 100%;
}

body,
html {
  margin: 0px;
  padding: 0px;
  height: 100%;
}

.fashionText {
  font-family: AlteDIN1451Mittelschrift;
  font-weight: bold;
  color: rgba(255, 255, 255, 0);
  text-shadow: 0px 1px 1px rgba(217, 199, 128, .4);
  background: linear-gradient(180deg, #996633 8%, #ffff99 9%, #ffcc33 9.4%, #996600 14.4%, yellow 15%, #CFA614 16%, yellow 29.99%, #ffff99 30.4%, #996600 42%, yellow 50%, #996633 60%, #ffcc33 65%, #996600 68%, yellow 75%, #cc9933 80%, #CFA614 100%);
  /* autoprefixer: off */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  /* autoprefixer: on */
}

.fashion-click {
  font-family: AlteDIN1451Mittelschrift;
  font-weight: bold;
  color: rgba(255, 255, 255, 0);
  text-shadow: 0px 1px 1px rgba(217, 199, 128, .4);
  background: linear-gradient(180deg, #996633 8%, #ffff99 9%, #ffcc33 9.4%, #996600 14.4%, yellow 15%, #CFA614 16%, yellow 29.99%, #ffff99 30.4%, #996600 42%, yellow 50%, #996633 60%, #ffcc33 65%, #996600 68%, yellow 75%, #cc9933 80%, #CFA614 100%);
}

.minWidth {
  min-width: 500px
}

.maxWidth {
  max-width: 300px;
}

</style>
