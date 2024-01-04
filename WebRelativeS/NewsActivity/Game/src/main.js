// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
import VueClipboard from 'vue-clipboard2';
import { Popup } from 'mint-ui';

Vue.component(Popup.name, Popup);
Vue.use(VueClipboard)
Vue.use(ElementUI);
import stepPageComponent from './components/stepPageComponent/index.js'
import pubgPageComponent from './components/pubgPageComponent/index.js'
import resultPageComponent from './components/resultPageComponent/index.js'
import 'babel-polyfill'
import Es6Promise from 'es6-promise'
require('es6-promise').polyfill()
Es6Promise.polyfill()
Vue.use(stepPageComponent)
Vue.use(pubgPageComponent)
Vue.use(resultPageComponent)
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
