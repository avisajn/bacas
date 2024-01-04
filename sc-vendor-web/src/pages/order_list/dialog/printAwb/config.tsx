import $lan from '../../../../lan'

const wordLang: any = {

  button_sure: {
    en: 'OK',
    zh: '确认',
    yn: 'OK'
  },
  order_number: {
    en: 'order number',
    zh: '订单编号',
    yn: 'nomor pesanan'
  },
  logistics_number: {
    en: 'logistics number',
    zh: '快递单号',
    yn: 'Nomor Resi'
  },
  button_print_label: {
    en: 'print label',
    zh: '打印快递单',
    yn: 'cetak label'
  },
}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj


