import $lan from '../lan'
import { routeItem } from '../interface'

import Index from '../pages/index'
import OrderList from '../pages/order_list'
import printAwbList from '../pages/order_list/dialog/printAwb'
import Settings from '../pages/settings'
import Login from '../pages/login'
import OrderHistory from '../pages/order_history'



const routesList:Array<routeItem> = [
  {
    component: Index,
    url: '/',
    props: {
      title: {
        en: 'My products',
        zh: '我的商品',
        yn: 'Produk saya'
      }
    }
  },
  {
    component: OrderList,
    url: '/order_list',
    props: {
      title: {
        zh: '我的订单',
        en: 'My orders',
        yn: 'Pesanan saya'
      }
    }
  },
  {
    component: printAwbList,
    url: '/awb_list',
    props: {
      title: {
        zh: '打印快递单',
        en: 'print awb',
        yn: 'cetak resi yang terpilih'
      }
    }
  },
  {
    component: OrderHistory,
    url: '/order_history',
    props: {
      title: {
        en: 'manifest list history',
        zh: '发货清单列表',
        yn: 'riwayat daftar pengiriman'
      }
    }
  },
  {
    component: Settings,
    url: '/settings',
    props: {
      title: {
        en: 'Settings',
        zh: '设置'
      }
    }
  },
  {
    component: Login,
    url: '/login',
    props: {
      title: {
        en: 'login',
        zh: '登录'
      }
    }
  },
]

export const routes = routesList.map((val:routeItem) => {
  const showTitle = $lan(val.props?.title, null)
  val.props.title = showTitle
  return val
})
