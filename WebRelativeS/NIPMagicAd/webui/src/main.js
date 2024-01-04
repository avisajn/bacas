import Vue from 'vue'
import App from './App'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css' // 使用 carbon 主题
import VueRouter from 'vue-router'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(VueRouter)

Vue.use(MuseUI)
Vue.use(ElementUI);
console.log(window.location);
if(window.location.origin.indexOf('localhost') > 0){
	window.ENV = 'dev';
}else{
	window.ENV = 'prod';
}


window.country = 'id';			// br
window.countryTime = '+07:00';	// br : 

new Vue({ // eslint-disable-line
  el: '#app',
  render: h => h(App),
  router,
  store
}).$mount('#app')