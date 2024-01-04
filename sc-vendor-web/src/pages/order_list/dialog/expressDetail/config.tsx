import $lan from '../../../../lan'

const wordLang: any = {

  button_cancel: {
    en: 'not now',
    zh: '稍后',
    yn: 'tidak'
  },
  button_sure: {
    en: 'cancel order',
    zh: '取消订单',
    yn: 'Batalkan pesanan'
  },
  success: {
    zh: '订单编号 XXX 取消成功！ 扣罚金共Rpxxx.xxx。 请及时更新库存。',
    en: "cancelled successfully! Charged penalty RpXXX.XXX in total. Please don't forger update the stock of your product!",
    yn: 'berhasil dibatalkan! Dikenakan denda total RpXXX.XXX. Jangan lupa update stok produk Anda!'
  },
  regular_order: {
    en: 'Cancel order will charge <span class="penalty"> penalty</span>. Are you sure to cancel this order ?',
    zh: '取消订单将产生<span class="penalty">罚金</span>。确定取消吗？',
    yn: 'Membatalkan pesanan akan dikenakan <span class="penalty">denda</span>. Yakin batalkan pesanan ini?'
  },
  combined_order: {
    en: 'Cancel order will charge <span class="penalty">penalty</span>. This is a combined order.Are you sure to cancel the whole order? ',
    zh: '取消订单将产生<span class="penalty">罚金</span>。这是合并订单，确定取消吗？',
    yn: 'Membatalkan pesanan akan dikenakan <span class="penalty">denda</span>. Ini adalah pesanan gabungan.Yakin batalkan semua pesanan?'
  },
}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj


