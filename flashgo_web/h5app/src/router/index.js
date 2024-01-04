import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Channel from '@/components/Channel'
import FlashSale from '@/components/FlashSale'
import Detail from '@/components/Detail'
import Search from '@/components/Search'
import SearchResult from '@/components/SearchResult'
import VideoDetail from '@/components/VideoDetail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/channel/:channelId/:channelTitle',
      name: 'Channel',
      component: Channel
    },
    {
      path: '/flash_sale',
      name: 'FlashSale',
      component: FlashSale
    },
    {
      path: '/detail/:dealId',
      name: 'Detail',
      component: Detail
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/search_result/:query',
      name: 'SearchResult',
      component: SearchResult
    },
    {
      path: '/videodetail/:videoId',
      name: 'VideoDetail',
      component: VideoDetail
    },
  ]
})
