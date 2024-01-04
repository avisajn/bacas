import $lan from '../../lan'

const wordLang:any = {
  product_id: {
    en: 'product id',
    zh: '商品id',
    yn: 'kode produk'
  },
  product_title: {
    en: 'product title',
    zh: '商品title',
    yn: 'judul produk'
  },
  shopee_url: {
    en: 'url',
    zh: 'URL',
    yn: 'url/link'
  },
  status: {
    en: 'status',
    zh: '商品状态',
    yn: 'status'
  },
  search: {
    en: 'search',
    zh: '搜索',
    yn: 'cari'
  },
  stockTitle: {
    en: 'Stock',
    zh: '库存',
    yn: 'Stok'
  },
  changeStock: {
    en: 'change stock',
    zh: '改库存',
    yn: 'ubah stok'
  },
  changeOnline: {
    en: 'online',
    zh: '上线',
    yn: 'Online'
  },
  changeOffline: {
    en: 'offline',
    zh: '下线',
    yn: 'Offline'
  },
  changeManyOnline: {
    en: 'batch online',
    zh: '批量上线',
    yn: 'online yang terpilih'
  },
  changeManyOffline: {
    en: 'batch offline',
    zh: '批量下线',
    yn: 'offline yang terpilih'
  },
  chooseOne: {
    en: 'Please select at least one product first.',
    zh: '请选中至少一个商品',
    yn: 'Harap pilih minimal satu produk',
  },
  onlineSuccess: {
    en: 'online successfully',
    zh: '上线成功',
    yn: 'berhasil online'
  },
  onlineNoStockSuccess: {
    en: 'opreate successfully, the product has been put into the out of stock list',
    zh: '操作成功，商品已被放入缺货列表',
    yn: 'tindakan berhasil, produk telah dimasukkan dalam daftar stok habis'
  },
  onlineManySucess: {
    en: 'batch online successfully',
    zh: '批量上线成功',
    yn: 'online yang terpilih berhasil'
  },
  offlineSuccess: {
    en: 'offline successfully',
    zh: '下线成功',
    yn: 'offline berhasil'
  },
  offlineManySucess: {
    en: 'batch offline successfully',
    zh: '批量下线成功',
    yn: 'offline yang terpilih berhasil'
  },
  inTotal: {
    en: 'in total',
    zh: '总量',
    yn: 'secara total'
  },
  total: {
    en: 'Total',
    zh: '总量',
    yn: 'Total'
  },
  submitChangeStock: {
    en: 'Submit',
    zh: '提交',
    yn: 'OK'
  },
  noSearchResult: {
    en: 'No search results',
    zh: '无搜索结果',
    yn: 'Tidak ada hasil pencarian'
  },
  empty: {
    en: 'No product',
    zh: '没数据',
    yn: 'Tidak ada produk terkait'
  },
  defaultSku: {
    en: 'Single variant',
    zh: '默认规格',
    yn: 'Varian tunggal'
  },
  sureBtn: {
    en: 'ok',
    zh: '确认',
    yn: 'ya'
  },
  cancelBtn: {
    en: 'cancel',
    zh: '取消',
    yn: 'batalkan'
  },
  generalFaild: {
    en: 'failed，please try again',
    zh: '失败，请重试',
    yn: 'gagal, silakan coba lagi'
  },
  changeStockSuccess: {
    en: 'Stock change successfully',
    zh: '库存修改成功',
    yn: 'Perubahan stok berhasil'
  },
  changeStockSuccess2: {
    en: 'Stock change successfully, the product is online now.',
    zh: '库存修改成功，已上线',
    yn: 'Perubahan stok berhasil, produk sedang online sekarang.'
  },
  changeStockSuccess3: {
    en: 'Stock change successfully, the product has been put into the out of stock list',
    zh: '库存修改成功，商品已放入缺货list',
    yn: 'Perubahan stok berhasil, produk telah dimasukkan dalam daftar stok habis'
  },
}

const obj:any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj

const status = [
  {
    title: {
      en: 'all',
      zh: 'all',
      yn: 'semua'
    },
    key: 0,
    number: 0,
    value: 0,
  },
  {
    title: {
      en: 'online',
      zh: 'online',
      yn: 'Online'
    },
    key: 1,
    number: 0,
    value: 1,
  },
  {
    title: {
      en: 'offline',
      zh: 'offline',
      yn: 'Offline'
    },
    key: 2,
    number: 0,
    value: 2,
  },
  {
    title: {
      en: 'out of stock',
      zh: 'out of stock',
      yn: 'Stok habis'
    },
    key: 3,
    number: 0,
    value: 3,
  },

]
const statusArr = status.map(val => ({...val, title: $lan(val.title, null)}))
const tableColumn = [
  {
    dataIndex: 'select',
    key: 'select',
    align: 'center',
    width: '5%',
  },
  {
    title: {
      en: 'product id',
      zh: '商品id',
      yn: 'kode produk'
    },
    dataIndex: 'code',
    key: 'code',
    align: 'center',
    width: '10%',
    render: (code:string) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{code}</div>
    ),
  },
  {
    title: {
      en: 'product title',
      zh: '商品title',
      yn: 'judul produk'
    },
    dataIndex: 'title',
    key: 'title',
    align: 'left',
    width: '25%',
  },
  {
    title: {
      en: 'image',
      zh: '商品图',
      yn: 'gambar'
    },
    dataIndex: 'cover_image_url',
    key: 'cover_image_url',
    align: 'center',
    width: '10%',
  },
  {
    title: {
      en: 'price',
      zh: '价格',
      yn: 'harga'
    },
    dataIndex: 'show_contract_price',
    key: 'contract_price',
    align: 'center',
    width: '15%',
    render: (text:any) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
        Rp{text}
      </div>
    ),
    sorter: (a:any, b:any) => a.contract_price - b.contract_price
  },
  {
    title: {
      en: 'total stock',
      zh: '总库存',
      yn: 'jumlah stok'
    },
    dataIndex: 'stock',
    key: 'stock',
    align: 'center',
    width: '10%',
    render: (text:any) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
        {text}
      </div>
    ),
  },
  {
    title: {
      en: 'status',
      zh: '商品状态',
      yn: 'status'
    },
    dataIndex: 'status',
    key: 'status',
    render: (text:number) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
        <span className={`status_word status-${text}`}>{statusArr.filter(val => val.value === text)[0].title}</span>
      </div>
    ),
    align: 'center',
    width: '10%',
  },
  {
    title: {
      en: 'action',
      zh: '操作',
      yn: 'tindakan'
    },
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    width: '15%'
  }
]

export const column = tableColumn.map((val:any) => {
  const obj:any = val
  obj.title = val.title ? $lan(val.title, null) : ''
  return obj
})

export const statusList = statusArr