import Vue from 'vue'
import Router from 'vue-router'
import TOKOPEDIA from '@/components/TOKOPEDIA';
import SHOPEE from '@/components/SHOPEE';
import LAZADA from '@/components/LAZADA';
import Bhinneka from '@/components/Bhinneka'
// import Checkin from '@/components/Checkin';
Vue.use(Router)

export default new Router({
  routes: [
    //  {
    //   path: '/',
    //   name: 'TOKOPEDIA',
    //   component: TOKOPEDIA
    // },
    // {
    //   path: '/',
    //   name: 'SHOPEE',
    //   component: SHOPEE
    // },
    // {
    //   path: '/',
    //   name: 'LAZADA',
    //   component: LAZADA
    // },
    {
      path: '/',
      name: 'Bhinneka',
      component: Bhinneka
    },
  ]
})
