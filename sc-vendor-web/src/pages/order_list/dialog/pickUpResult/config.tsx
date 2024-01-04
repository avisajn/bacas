import $lan from '../../../../lan'

const wordLang: any = {

  button_sure: {
    en: 'OK',
    zh: '确认',
    yn: 'OK'
  },
  button_print_awb: {
    en: 'batch print awb',
    zh: '批量打开快递单链接',
    yn: 'cetak resi yang terpilih'
  },
  button_export_list: {
    en: 'export manifest list',
    zh: '导出发货清单',
    yn:'Ekspor daftar pengiriman'
  },
  error_text: {
    en: 'request failed. Please choose other express company or  try request again later. If still fail, please contact our BD for more solutions.',
    zh: '预约失败。请选择其他快递公司或者稍后尝试再次预约。如果还是失败，请联系BD寻求其他解决办法',
    yn: 'permintaan gagal. Silakan pilih ekspedisi lain atau coba lagi nanti. Jika masih gagal, silakan hubungi tim BD untuk solusi lebih lanjut.'
  },
  success_text: {
    en: 'Request pick up successfully! please pack and print label asap!',
    zh: '叫快递成功！请尽快打包和打印快递单，',
    yn: 'Request pick up berhasil! Segera bungkus dan cetak label!'
  },
  title: {
    en: 'Request pick up result',
    zh: '预约快递结果',
    yn: 'Detail request pick up'
  },
  order_number: {
    en: 'order number',
    zh: '订单编号',
    yn: 'nomor pesanan'
  },
  export_success: {
    en: 'Export manifest list successfully! You can also find it on the manifest list history page.',
    zh: '发货清单导出成功！您也可以在manifest list history 页面再次找到它',
    yn: 'Ekspor daftar pengiriman berhasil! Anda juga dapat melihatnya di halaman riwayat daftar pengiriman.'
  },
  export_error: {
    en: 'Failed to download. You can find it on the manifest list history page and try to download again.',
    zh: '下载失败。您可以去manifest list history页面找到它并尝试再次下载',
    yn: 'Gagal mengunduh. Anda dapat melihatnya di halaman riwayat daftar pengiriman dan coba unduh lagi.'
  },
  exported: {
    en: 'Already exported before. you can check the manifest list on the manifest list history page.',
    zh: '已经导出过。您可以在manifest list history page找到它。',
    yn: 'Sudah diekspor sebelumnya. Anda dapat memeriksa daftar pengiriman di halaman riwayat daftar pengiriman.'
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
  download_error: {
    zh: '生成快递单失败，请检查网络后重试',
    en: 'Failed to generate labels, please check the network and try again',
    yn: 'Gagal membuat label, harap periksa jaringan dan coba lagi'
  }
}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj
export const tableColumn = [
  {
    title: {
      zh: 'No',
      en: 'No',
      yn: 'no'
    },
    render: (text: any, record: any, index: number) => `${index + 1}`,
  },

  {
    title: {
      zh: '订单号',
      en: "Order No",
      yn: 'nomor pesanan'
    },
    key: 'combined_key',
    dataIndex: 'combined_key',
    render: (combined_key: any) => (
      <>
        {combined_key}
      </>
    ),
  },
  {
    title: {
      zh: '创建时间',
      en: 'order time',
      yn: 'waktu pembuatan'

    },
    width: '110px',
    key: 'create_time',
    dataIndex: 'create_time',
    render: (create_time: any) => (
      <>
        {window.$utils.$time(create_time, 8)}
      </>
    ),
  },
  {
    title: {
      zh: '物流信息',
      en: 'Nomer Resi',
      yn: 'info ekspedisi'
    },
    dataIndex: 'order_express_info',
    render: (order_express_info: any, row: any) => (
      <>
        {row ? 
        <div>
          <div>{row.express_name}</div>
          <a href={row.express_url} target="_blank" rel="noreferrer">{row.express_no}</a>
        </div> : ''}
      </>
    ),
  },
  {
    title: {
      zh: 'sku',
      en: 'SKU',
      yn: 'varian'
    },
    dataIndex: 'orders',
    className: "sku-column",
    render: (orders: any, row: any) => (
      <>
        {
          orders.map((sku: any, index: number) => {
            return sku.order_sku.map((val: any, idx: number) => {
              return <div key={idx} className={row.is_combined_order ? "combined-sku" : ""}>
                {row.is_combined_order ? sku.product_title.split(" ").slice(-1) + ': ' + val.sku_properties.toString() : (val.sku_properties.toString() || "")}
                <span className="sku-amount"> {val.sku_properties.length > 0 ? <span> * </span> : ""}</span>
                <span className="sku-amount">{val.amount}</span>
              </div>
            })
          })
        }
      </>
    ),
  },
  {
    title: {
      zh: '数量',
      en: 'Qty in total',
      yn: 'jumlah produk'
    },
    key: 'orders',
    dataIndex: 'orders',
    render: (orders: any, row: any) => (
      <>
        {
          <div>{count(orders)}</div>
        }
      </>
    ),
  },
];


const count = (orders:any) => {
  const arr: Array<number> = []
  orders.forEach((item: any) => {
    item.order_sku.forEach((val: any) => {
      arr.push(val.amount)
    })
  })
  const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
  return arr.reduce(reducer)
}
export const columns = tableColumn.map((val: any) => {
  const obj: any = val
  obj.title = $lan(val.title, null)
  return obj
})

