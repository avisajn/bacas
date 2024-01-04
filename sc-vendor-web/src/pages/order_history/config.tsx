import $lan from '../../lan'
import { logisiticDomain } from '../../config/index'
import { Popover } from 'antd'
const wordLang:any = {
  top_tip: {
    en: 'Only keep the history of the last one month',
    zh: '只保留最近一个月记录',
    yn: 'Hanya menyimpan riwayat satu bulan terakhir'
  },
  export_time: {
    en: 'export time',
    zh: '导出时间',
    yn: 'waktu ekspor'
  },
  order_no: {
    en: 'order number',
    zh: '订单编号',
    yn: 'nomor pesanan'
  },
  search: {
    en: 'search',
    zh: '搜索',
    yn: 'cari'
  },
  download: {
    en: 'download',
    zh: '下载',
    yn: 'unduh'
  },
  inTotal: {
    en: 'in total',
    zh: '共计',
    yn: 'secara total'
  },
  download_tip: {
    en: 'download PDF',
    zh: '下载 PDF',
    yn: 'unduh PDF'
  },
  noSearchResult: {
    en: 'No search results',
    zh: '无搜索结果',
    yn: 'Tidak ada hasil pencarian'
  },
  empty: {
    en: 'No product',
    zh: '没数据',
    yn: 'Tidak ada terkait'
  },
  generalFaild: {
    en: 'failed，please try again',
    zh: '失败，请重试',
    yn: 'gagal, silakan coba lagi'
  },
  downloadSuccess: {
    en: 'download success',
    zh: '下载成功',
    yn: 'unduh berhasil'
  },
  total: {
    en: 'Total',
    zh: '总量',
    yn: 'Total'
  },
  fromApp: {
    en: 'App',
    zh: 'App',
    yn: 'App'
  },
  fromBack: {
    en: 'backend',
    yn: 'backand',
    zh: '后台'
  }
}

const obj:any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const words = obj

const tableColumn = [
  {
    title: {
      en: 'No',
      zh: '序号',
      yn: 'NO'
    },
    dataIndex: 'key',
    key: 'key',
    align: 'center',
    width: '5%',
    render: (key:number) => (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{key + 1}</div>
    ),
  },
  {
    title: {
      en: 'order number',
      yn: 'Order No',
      zh: '订单编号'
    },
    dataIndex: 'order_no',
    key: 'order_no',
    align: 'center',
    width: '13%',
    render: (text:any) => {
      return (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
          <div style={{height: '100%'}}>{text}</div>
        </div>
      )
    },
  },
  {
    title: {
      en: 'order time',
      zh: '创建时间',
      yn: 'waktu pembuatan'
    },
    dataIndex: 'create_time',
    key: 'create_time',
    align: 'center',
    width: '10%',
    render: (ct: number) => {
      return window.$utils.$time(ct * 1000)
    }
  },
  {
    title: {
      yn: 'Nomer Resi',
      zh: '快递单号',
      en: 'express number'
    },
    dataIndex: 'express_info',
    key: 'express_info',
    render: (express_info:any) => (
      express_info.express_no?
      <Popover content={<p style={{margin: 0}}>{`${logisiticDomain}${window.encodeURIComponent(window.btoa(express_info.express_no))}`}</p>} title={null}>
        <div className="inner_td" style={{ wordWrap: 'break-word', wordBreak: 'break-word', minHeight: '100px' }}>
            {express_info.express_company ? `${express_info.express_company}:` : ''} <a href={`${logisiticDomain}${window.encodeURIComponent(window.btoa(express_info.express_no))}`} target="_blank" rel="noreferrer">{express_info.express_no || ''}</a>
        </div>
      </Popover>
      :
      <div className="inner_td"></div>
    ),
    align: 'center',
    width: '15%',
  },
  {
    title: {
      yn: 'SKU',
      zh: '规格',
      en: 'sku'
    },
    dataIndex: 'sku_list',
    key: 'sku_list',
    align: 'left',
    width: '18%',
    render: (sku_list:Array<any>, item:any) => {
      return (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{
          sku_list.map((val:any, index:number) => {
            return (
              <div key={index} style={{marginTop: index ? '10px' : ''}}>
                {
                  item.order_no.includes('C') ? 
                  <span>{val.sku?.product_title.split(' ')[val.sku?.product_title.split(' ').length - 1]}: </span>                  
                  :
                  null
                }
                {
                  val.sku?.sku_properties ?
                  <span>{Object.values(val.sku?.formated_sku_properties).join(',')} * </span>
                  :
                  null
                }
                <span>{val.count}</span>
              </div>
            )
          })
        }</div>
      )
    },
  },
  {
    title: {
      yn: 'Qty in total',
      zh: '总数量',
      en: 'total amount'
    },
    dataIndex: 'total_sku_count',
    key: 'total_sku_count',
    align: 'center',
    width: '7%'
  },
  {
    title: {
      yn: 'Label tercetak',
      zh: '快递单打印',
      en: 'label printed'
    },
    dataIndex: 'label',
    key: 'label',
    align: 'center',
    width: '9%',
  },
  {
    title: {
      yn: 'Dikemas',
      zh: '打包',
      en: 'Packed'
    },
    align: 'center',
    width: '9%'
  },
  {
    title: {
      yn: 'Pickup Oleh Kurir',
      zh: '发件人取货',
      en: 'pick up by sender'
    },
    align: 'center',
    width: '9%'
  }
]

export const column = tableColumn.map((val:any) => {
  const obj:any = val
  obj.title = $lan(val.title, null)
  return obj
})
