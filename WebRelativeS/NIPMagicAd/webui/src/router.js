import Vue from 'vue'
import Router from 'vue-router'
import Index from './components/index'
import Offer from './views/Offer'
Vue.use(Router)


const router = new Router({
  // mode: 'history',
  routes: [
   { path: '/', component: Offer },
   { path: '/offer', component: Offer }
  ]
})

export default router
