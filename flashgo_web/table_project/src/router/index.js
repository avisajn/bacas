import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
// import tab from "@/components/tab";
// import tab_one  from "@/components/tab_one";
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Table',
      component: Table
    },
    // {
    // 	path: '/tab',
    // 	name: 'tab',
    // 	component: tab
    // },
    // {
    // 	path: '/tab_one',
    // 	name: 'tab_one',
    // 	component: tab_one
    // },
  ]
})
