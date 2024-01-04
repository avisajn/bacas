import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import activity from '@/components/activity'
import share from '@/components/share'
import Banner from '@/components/banner/Banner'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
     {
      path: '/activity',
      name: 'activity',
      component: activity
    },
    {
      path: '/share',
      name: 'share',
      component: share
    },
    {
      path: '/Banner',
      name: 'share',
      component: Banner
    },
    
  ]
})
