import $lan from '../../lan'

const wordLang: any = {
  failed: {
    en: 'failed，please try again',
    zh: '失败请重试',
    yn: 'gagal, silakan coba lagi'
  },
  no_result: {
    en: 'No search results',
    zh: '无搜索结果',
    yn:'Tidak ada hasil pencarian'
  },
  product_id: {
    en: 'product id',
    zh: '商品id',
    yn: 'kode produk'
  },
  product_title: {
    en: 'product title',
    zh: '商品标题',
    yn: 'judul produk'
  },
  status: {
    en: 'status',
    zh: '商品状态',
    yn: 'status',
  },
  search: {
    en: 'search',
    zh: '搜索',
    yn: 'cari'
  },
  created_time: {
    en: 'created time',
    zh: '创建时间',
    yn: 'waktu pembuatan'
  }, 
  order_number: {
    en: 'order number',
    zh: '订单号',
    yn: 'nomor pesanan'
  },
  process_status: {
    en: 'process status',
    zh: '状态',
    yn: 'status proses'
  },
  logistics_number: {
    en: 'logistics number',
    zh: '快递单号',
    yn: 'Nomor Resi'
  },
  logistics_company: {
    en: 'logistics company',
    zh: '快递公司',
    yn: 'Ekspedisi'
  },
  logistics_options_company: {
    en: 'logistics company',
    zh: '快递公司',
    yn: 'Layanan ekspedisi'
  },
  request_pick_up_time: {
    en: 'request pick up time',
    zh: '取货时间',
    yn: 'waktu request pick up'

  },
  order_status: {
    en: 'order status',
    zh: '订单状态',
    yn: 'status proses'
  },

  open_link: {
    en: "open shopee link",
    zh: "打开shopee链接",
    yn: 'buka link shopee'
  },
  total_price: {
    en: "total price",
    zh: '订单价格',
    yn: "Total pembayaran",
  },
  price: {
    en: "price",
    zh: "价格",
    yn: 'harga'
  },
  // delivering tab 
  button_export_manifest_list: {
    en: 'export manifest list',
    zh: '导出快递单',
    yn: 'Ekspor daftar pengiriman'
  },
  warning_text: {
    en: 'auto cancel warning',
    zh: "警告",
    yn: 'hampir batal otomatis'
  },
  not_printed: {
    en: 'lable not printed',
    zh: "未打印",
    yn: 'label belum dicetak'
  },
  printed: {
    en: 'label printed',
    zh: "已打印",
    yn: 'label sudah dicetak'
  },
  request_time: {
    en: "request time",
    zh: "物流信息",
    yn: 'waktu request pick up'
  },
  export_success: {
    en: 'Export manifest list successfully! You can also find it on the manifest list history page.',
    zh: "发货清单导出成功！您也可以在manifest list history 页面再次找到它",
    yn: 'Ekspor daftar pengiriman berhasil! Anda juga dapat melihatnya di halaman riwayat daftar pengiriman.'
  },
  export_error: {
    en: '下载失败。您可以去manifest list history页面找到它并尝试再次下载',
    zh: "Failed to download. You can find it on the manifest list history page and try to download again.",
    yn: 'Gagal mengunduh. Anda dapat melihatnya di halaman riwayat daftar pengiriman dan coba unduh lagi.'
  },
  export_no_order: {
    en: 'No new order, please check later.',
    zh: "暂无可导",
    yn: 'Tidak ada pesanan baru, mohon cek kembali nanti.'
  },

  // action 按钮
  action_order_detail: {
    en: 'order detail',
    zh: '详情',
    yn: 'Detail pesanan'
  },
  action_request_pickup: {
    en: 'request pick up',
    zh: '叫快递',
    yn: 'request pick up'
  },
  action_cancel: {
    en: 'cancel order',
    zh: '取消订单',
    yn: 'batalkan pesanan'
  },
  button_print_label: {
    en: 'print label',
    zh: '打印快递单',
    yn: 'cetak label'
  },
  button_express_detail: {
    en: 'express detail',
    zh: '物流详情',
    yn: 'detail ekspedisi'
  },
  button_batch_request_pickup: {
    en: 'batch request pick up',
    zh: '批量叫快递',
    yn: 'request pick up yang terpilih'
  },
  button_select_all: {
    en: 'Select all',
    zh: '全选',
    yn: 'Pilih semua'
  },
  empty_words: {
    en: 'No search results',
    zh: '无搜索结果',
    yn: 'Tidak ada pesanan terkait'
  },
  search_error: {
    zh: '无搜索结果',
    en: 'No search results',
    yn: 'Tidak ada hasil pencarian'
  },
  shipments_title: {
    yn: 'Mohon Perhatian Sobat Mokkaya',
  },
  shipments_primary_title: {
    yn: 'Hindari melakukan drop paket di gerai - gerai kurir SiCepat, dikarenakan alasan teknis.',
  },
  shipments_content: {
    yn: '<span>1.</span> Kamu hanya perlu melakukan request pick up dan menunggu kurir mengambil paket.</br> <span>2.</span> Pastikan hanya menempel label resi Mokkaya.</br> <span>3.</span> Kamu wajib meminta tanda terima pick up dari kurir SiCepat. Jika kurir tidak memberikan, kamu boleh membuat daftar pick up sendiri berisi nomor resi satuan dan meminta tanda tangan kurir. bukti ini penting sebagai syarat pengajuan klaim jika paket hilang,</br> <span>Mokkaya tidak bertanggung jawab jika terjadi kendala seperti yang disebutkan di atas jika vendor tidak mengikuti himbauan ini.</span></br> Jika ada kendala lain, para seller bisa menghubungi tim Mokkaya untuk mendapatkan bantuan.'
  },
  express_down_load: {
    zh: '批量打印全部未打印订单',
    en: 'Batch print all unprinted orders',
    yn: 'Cetak label sekaligus semua pesanan yang belum cetak'
  },
  select_express: {
    zh: '批量打印已选订单',
    en: 'Batch print all selected orders',
    yn: 'cetak resi yang terpilih'
  },
  no_not_printed_order: {
    zh: '没有未打印的订单',
    en: 'no unprinted orders',
    yn: 'Tidak ada label yang perlu dicetak'
  },
  no_selected: {
    zh: '没有选中任何的订单',
    en: 'not selected orders',
    yn: 'Belum memilih pesanan'
  },
  download_error: {
    zh: '生成快递单失败，请检查网络后重试',
    en: 'Failed to generate labels, please check the network and try again',
    yn: 'Gagal membuat label, harap periksa jaringan dan coba lagi'
  },
  loading_tips: {
    zh: '快递单生成中，请稍候',
    en: 'labels are being generated, please wait',
    yn: ' Label sedang dibuat, harap tunggu'
  },
  print_allow_toast: {
    zh: '批量打印上限为50，将为您优先打印最早的 50 个快递单',
    en: 'The upper limit of batch printing is 50, and the earliest  50 labels will be printed first for you',
    yn: 'Batas pencetakan sekaligus adalah 50, dan 50 label akan lebih dulu dicetak untuk Anda'
  },
  print_allow_toast_ok: {
    zh: '好的 先打印50个快递单',
    en: 'OK, print 50 labels first',
    yn: 'OK, cetak 50 label sekarang'
  },
  print_allow_toast_no: {
    zh: '取消打印',
    en: 'Cancel printing ',
    yn: 'Batalkan pencetakan'
  },

}
const obj: any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj

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
      en: 'delivering',
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
    index: 4 ,
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
export const statusText = {
  1: 'status1'
}

export const statusOrders = [
  {
    id: 0,
    name: {
      en: 'all',
      zh: '全部',
      yn: 'semua'
    }
  },
  {
    id: 1,
    name: {
      en: 'auto cancel waring',
      zh: '自动取消警告',
      yn: 'hampir batal otomatis'
    },
    value: 'hours_to_cancel_max'
  }, {
    id: 2,
    name: {
      en: 'label not printed',
      zh: '未打印',
      yn: 'label belum dicetak'
    },
    value: 'express_label_printed'
  }, {
    id: 3,
    name: {
      en: 'label printed',
      zh: '已打印',
      yn: 'label sudah dicetak'
    },
    value: 'express_label_printed'
  }, {
    id: 4,
    name: {
      en: 'successfully pick up',
      zh: '取货成功',
      yn: 'pick up sukses'
    },
    value: 'express_picked_up'
  }
]
export const processStatus = statusOrders.map(val => ({ ...val, name: $lan(val.name, null) }))

export const companyStatus = [
  {
    id: 0,
    name: {
      en: 'all',
      zh: '全部',
      yn: 'Semua'
    }
  },
  {
    id: 2,
    name: {
      en: 'JNE',
      zh: 'JNE',
      yn: 'JNE Express'
    }
  }, {
    id: 4,
    name: {
      en: 'SiCepat Express',
      zh: 'SiCepat Express',
      yn: 'SiCepat Express'
    }
  },
  {
    id: 27,
    name: {
      en: 'SAP',
      zh: 'SAP',
      yn: 'SAP'
    }
  }
]
export const companyName = companyStatus.map(val => ({ ...val, name: $lan(val.name, null) }))

export const companyOptionStatus = [
  {
    id: null,
    name: {
      en: 'all',
      zh: '全部',
      yn: 'Semua'
    }
  },
  {
    id: 1,
    name: {
      en: 'Reguler',
      zh: 'Reguler',
      yn: 'Reguler'
    }
  }, {
    id: 2,
    name: {
      en: 'Kargo',
      zh: 'Kargo',
      yn: 'Kargo'
    }
  },
]
export const companyOptionsName = companyOptionStatus.map(val => ({ ...val, name: $lan(val.name, null) }))


export const tableColumn = [
  {
    title: {
      zh: '订单号',
      en: 'order number',
      yn: 'nomor pesanan'
    },
    dataIndex: 'combined_key',
    key: 'combined_key',
    render: (combined_key: any, row: any) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
        <span className={row.is_combined_order ? "is-cod" : ''}>{combined_key}</span>
        {row.is_cod ? <span className="cod-tag" >COD</span> : ""}
      </div>
    ),
  },
 
  {
    title: {
      zh: '创建时间',
      en: "created_time",
      yn: 'waktu pembuatan'
    },
    key: 'create_time',
    dataIndex: 'create_time',
    sorter: true,
    render: (create_time:number) => (
      <>
        {window.$utils.$time(create_time, 8)}
      </>
    ),
  },
  {
    title: {
      zh: '状态',
      en: 'status',
      yn: 'status'
    },
    width: "20%",
    key: 'status_description',
    dataIndex: 'status_description',
    render: (status_description: any, row:any) => (
      <div className={'status status-' + row.status} style={{width: '120px', lineHeight: '17px'}}>
        { status_description }
      </div>
    ),
  },
  {
    title: {
      zh: '操作',
      en: 'action',
      yn: 'tindakan'
    },
    width: "20%",
    key: 'process_status',
    dataIndex: 'process_status',
    render: (process_status: any, row: any) => (
      <div>
        {
          row.status === 2 || row.status === 3 || row.status === 0 ?
            <div className="action-status">
              <span className={process_status === 'hampir batal otomatis' ? 'waning-text' : 'pick-up-text'}>{process_status}</span>
            </div>
            : ""
        }
        
        { 
          row.status === 3 || row.status === 0 ?
            ( 
              process_status === "pick up sukses" ? "" :
                <div className="action-status">
                  {row.express_label_printed ?
                    <span className="not-print-status">{words.printed}</span>
                    :
                    <span className="print-status">{words.not_printed}</span>
                  }
                </div>
            ): ""
        }
      </div>
    ),
  },
];
export const columns = tableColumn.map((val: any) => {
  const obj: any = val
  obj.title = $lan(val.title, null)
  return obj
})

export const logsTabName = [
 'orders_all',
 'orders_to_be_delivered',
 'orders_to_be_shipped',
 'orders_delivering',
 'orders_delivered',
 'orders_returned',  
 'orders_invalid',
]
export const logsTab = [
  'all',
  'to_be_delivered',
  'to_be_shipped',
  'delivering',
  'delivered',
  'returned',
  'invalid',
]


