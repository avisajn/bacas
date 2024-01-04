import $lan from '../../lan'
import { NavItem } from '../../interface'

const navList:Array<NavItem> = [
  {
    title: {
      en: 'My products',
      zh: '我的商品',
      yn: 'Produk saya'
    },
    url: '/',
    slide: false,
    select: false,
    icon: 'iconfont icon-shangpin1'
  },
  {
    title: {
      en: 'My orders',
      zh: '我的订单',
      yn: 'Pesanan saya'
    },
    children: [
      {
        url: '/order_list',
        title: {
          en: 'My orders',
          zh: '我的订单',
          yn: 'Pesanan saya'
        },
        select: false,
        icon: 'iconfont icon-list1'
      },
      {
        url: '/order_history',
        title: {
          en: 'manifest list history',
          zh: '发货清单列表',
          yn: 'riwayat daftar pengiriman'
        },
        select: false,
        icon: 'iconfont icon-icon_history'
      }
    ],
    icon: 'iconfont icon-order1',
    slide: false,
    select: false,
  },

  // {
  //   title: {
  //     en: 'settings',
  //     zh: '设置'
  //   },
  //   url: '/settings',
  //   slide: false,
  //   select: false,
  //   icon: 'iconfont icon-settings1'
  // }
]
const currentPath:string = window.location.pathname

export const nav = navList.map((val:any) => {
  const showTitle = $lan(val.title, null)
  val.title = showTitle
  if (val.children) {
    val.children.forEach((inner: any) => {
      const innerShowTitle = $lan(inner.title, null)
      inner.title = innerShowTitle
      if (inner.url === currentPath) {
        inner.select = true
        val.select = true
      }
      val.slide = true
    })
  } else {
    if (val.url === currentPath) {
      val.select = true
    }
  }
  return val
})