// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Numeral from 'numeral'
// import VueAwesomeSwiper from 'vue-awesome-swiper'
//
// import 'swiper/dist/css/swiper.css'
//
// Vue.use(VueAwesomeSwiper, /* { default global options } */)

Vue.config.productionTip = false

// Vue.use(Meta)

Vue.filter('formatMoney', function (value) {
  return Numeral(value).format('0,0').replace(/,/g, '.')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
