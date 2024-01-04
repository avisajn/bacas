import $lan from '../../../../lan'

const wordLang: any = {
  title: {
    en: 'stock check',
    zh: '检查库存',
    yn: 'cek stok'
  },
  button_cancel: {
    en: 'later',
    zh: '稍后',
    yn: 'batal'
  },
  button_sure: {
    en: 'request pickup',
    zh: '叫快递',
    yn: 'request pick up'
  },
  resure_title: {
    en: 'Process later?',
    zh: '稍后处理？',
    yn: 'Proses nanti?'
  },
  double_confirm: {
    en: 'Will request pick up, please ensure that all orders are packed before the courier comes.',
    zh: '将要叫快递，请确保所有订单都在快递员上门前打包完毕',
    yn: 'Akan request pick up, pastikan semua pesanan sudah dikemas sebelum kurir datang.'
  },
  default_sku: {
    en: 'Default specification',
    zh: '默认规格',
    yn: 'Varian tunggal'
  },
  order_number: {
    en: 'Order number',
    zh: '订单编号',
    yn: 'Nomor pesanan'
  },
  
}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj

