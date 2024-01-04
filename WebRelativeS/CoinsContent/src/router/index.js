import Vue from 'vue'
import Router from 'vue-router'
import Survey from '@/components/Survey';
import Checkin from '@/components/Checkin';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Checkin',
      component: Checkin
    },
     {
      path: '/Checkin',
      name: 'Checkin',
      component: Checkin
    },
     {
      path: '/Survey',
      name: 'Survey',
      component: Survey
    },
  ]
})
