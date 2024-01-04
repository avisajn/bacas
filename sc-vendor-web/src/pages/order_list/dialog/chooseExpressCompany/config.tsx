import $lan from '../../../../lan'

const wordLang: any = {

  button_cancel: {
    en: 'Cancel',
    zh: '取消',
    yn: 'Batal'
  },
  button_sure: {
    en: 'OK',
    zh: 'OK',
    yn: 'OK'
  },
  // title: {
  //   en: 'Choose express company',
  //   zh: '选择快递公司',
  //   yn: 'Pilih ekspedisi'
  // },
  title: {
    en: 'Express Company',
    zh: '快递公司',
    yn: 'Ekspedisi'
  },
  jne: {
    en: 'JNE Express',
    zh: 'JNE Express',
    yn: 'JNE Express'
  },
  sc: {
    en: 'SiCepat Express',
    zh: 'SiCepat Express',
    yn: 'SiCepat Express'
  },
  pick_up_time: {
    en: 'Pick up at',
    zh: '上门时间：',
    yn: 'Akan pick up'
  },
  order_number: {
    en: 'order number',
    zh: '订单编号',
    yn: 'nomor pesanan'
  },
  toast: {
    en: 'Please choose an express company first.',
    zh: '请先选择快递公司',
    yn: 'Mohon pilih ekspedisi dulu'
  },
  for_no: {
    en: 'For order no.',
    zh: '比如',
    yn: 'Untuk nomor pesanan'
  },
  // error_text: {
  //   en: 'request failed. Please choose other express company or  try request again later. If still fail, please contact our BD for more solutions.',
  //   zh: '预约失败。请选择其他快递公司或者稍后尝试再次预约。如果还是失败，请联系BD寻求其他解决办法',
  //   yn: 'permintaan gagal. Silakan pilih ekspedisi lain atau coba lagi nanti. Jika masih gagal, silakan hubungi tim BD untuk solusi lebih lanjut.'
  // },
  success_text: {
    en: 'Request pick up successfully! please pack and print label asap!',
    zh: '叫快递成功！请尽快打包和打印快递单，',
    yn: 'Request pick up berhasil! Segera bungkus dan cetak label!'
  },
  not_request: {
    en: 'not request now',
    zh: '暂时不叫快递',
    yn: 'tidak sekarang'
  },
  choose_text:{
    en: 'Please choose an express company:',
    zh: '请选择快递公司',
    yn: 'Pilih ekspedisi:'
  },
  error_text: {
    en: 'Sorry, the address is not supported by any express company, please contact BD for more solutions.',
    zh: '抱歉，所有快递公司都不支持该地址，请联系BD。',
    yn: 'Maaf, alamat tidak didukung ekspedisi manapun, hubungi tim BD untuk solusi.'
  },
  failed: {
    en: 'failed，please try again',
    zh: '失败请重试',
    yn: 'gagal, silakan coba lagi'
  },
}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj

