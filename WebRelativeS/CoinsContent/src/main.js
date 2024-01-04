// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import MintUI from 'mint-ui';
import 'mint-ui/lib/style.css';

import VueBlu from 'vue-blu'
import 'vue-blu/dist/css/vue-blu.min.css'

Vue.use(VueBlu)


Vue.config.productionTip = false
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);
Vue.use(MintUI);
/* eslint-disable no-new */
Vue.use(ElementUI);
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
