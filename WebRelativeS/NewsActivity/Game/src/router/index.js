import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import enterPage from '@/components/enter'
import Enname from '@/components/EnnameE'
import FfQ from '@/components/FfQ'
import PubgQ from '@/components/PubgQ'
import Result from '@/components/result'
import Ffresult from '@/components/Ffresult'
// import share from '@/components/share'
Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/enterpage',
      name: 'enterPage',
      component: enterPage
    },
    {
      path: '/ffquestion',
      name: 'FfQ',
      component: FfQ
    },
    {
      path: '/pubgquestion',
      name: 'PubgQ',
      component: PubgQ
    },

    {
      path: '/entername',
      name: 'Enname',
      component: Enname
    },
    {
      path: '/result',
      name: 'Result',
      component: Result
    },
    {
      path: '/ffresult',
      name: 'ffresult',
      component: Ffresult
    },
   

  ]
})
