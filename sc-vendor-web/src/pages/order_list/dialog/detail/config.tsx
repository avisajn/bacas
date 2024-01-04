import $lan from '../../../../lan'

const wordLang: any = {

  name: {
    en: 'name',
    zh: '姓名',
    yn: 'nomor pesanan'
  },
  address: {
    en: 'address',
    zh: '地址',
    yn: 'nomor pesanan'
  },
  logistics_info: {
    en: 'Logistics info',
    zh: '快递信息',
    yn: 'Info ekspedisi'
  },
  logistics_name: {
    en: 'logistics name',
    zh: '快递公司名称',
    yn: 'nomor pesanan'
  },
  logistics_number: {
    en: 'logistics number',
    zh: '快递单号',
    yn: 'nomor pesanan'
  },
  logistics_link: {
    en: 'logistics link',
    zh: '快递单链接',
    yn: 'nomor pesanan'
  },
  order_number: {
    en: 'order number',
    zh: '订单编号',
    yn: 'nomor pesanan'
  },
  recipient_info: {
    en: 'Recipient info',
    zh: '收件人信息',
    yn: 'Info resi'
  }, 
  order_info: {
    en: 'Order info',
    zh: '订单信息',
    yn: 'Info pesanan'
  },
  created_time: {
    en: 'create time',
    zh: '创建时间',
    yn: 'waktu pembuatan'
  },
  amount: {
    en: 'qty in total',
    zh: '总件数',
    yn: 'jumlah produk'
  },
  total_price: {
    en: 'total_price',
    zh: '订单金额',
    yn: 'total harga'
  },
  product_id: {
    en: 'product id',
    zh: '商品id',
    yn: 'kode produk'
  },
  sku: {
    en: 'sku',
    zh: 'sku',
    yn: 'varian'
  },
  price: {
    en: 'price',
    zh: '单价',
    yn: 'harga'
  },
  status: {
    en: 'status',
    zh: '状态',
    yn: 'status'
  },
  disbursement_info: {
    en: 'Disbursement info',
    zh: '结款信息',
    yn: 'Info pencairan'
  },
  disbursement_value: {
    en: 'disbursement value',
    zh: '结款金额',
    yn: 'nilai pencairan'
  },
  penalty: {
    en: 'penalty',
    zh: '罚金',
    yn: 'denda'
  },
  cancel_reason: {
    en: 'reason: cancel',
    zh: '罚金',
    yn: 'alasan：batal'
  },
  aftersale_reason: {
    en: 'reason: aftersale',
    zh: '罚金',
    yn: 'alasan：purna jual'
  },
  default_sku: {
    en: 'Default specification',
    zh: '默认规格',
    yn: 'Varian tunggal'
  },
  pick_up_time: {
    en: 'request pick up time',
    zh: '取货时间',
    yn: 'waktu request pick up'
  },
  delivered: {
    en: 'delivered',
    zh: '已收货',
    yn: 'Terkirim'
  },
  failed: {
    en: 'failed，please try again',
    zh: '失败请重试',
    yn: 'gagal, silakan coba lagi'
  },
}
export const statusNav = [
  {
    id: 0,
    index: 0,
    name: {
      en: 'all',
      zh: '全部',
      yn: 'Semua'
    }
  },
  // {
  //   id: 1,
  //   name: {
  //     en: 'to be shipped',
  //     zh: '待支付'
  //   }
  // },
  {
    id: 2,
    index: 1,
    name: {
      en: 'to be shipped',
      zh: '待发货',
      yn: 'Perlu dikirim'
    }
  }, {
    id: 3,
    index: 2,
    name: {
      en: 'deliverying',
      zh: '运输中',
      yn: 'Pengiriman'
    }
  }, {
    id: 4,
    index: 3,
    name: {
      en: 'delivered',
      zh: '已收货',
      yn: 'Terkirim'
    }
  }, {
    id: 5,
    index: 4,
    name: {
      en: 'returned',
      zh: '退货',
      yn: 'Dikembalikan'
    }
  }, {
    id: 6,
    index: 5,
    name: {
      en: 'invalid',
      zh: '失效',
      yn: 'Dibatalkan'
    }
  },
]
export const statusTab = statusNav.map(val => ({ ...val, name: $lan(val.name, null) }))
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj


