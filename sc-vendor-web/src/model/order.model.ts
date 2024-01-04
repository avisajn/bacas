import $ajax from '../libs/ajax'
// import mockOrderList from '../pages/order_history/mock'

// import $utils from '../libs/utils'


import { orderListQuery, detailParams, cancelOrderParams, expressParams, exportListParams } from '../interface/model/order'
import { orderHistoryQuery, expressPrint } from '../interface/model/order'

const apiVersion:string = 'v1'


const orderModel: any = {
  getOrderList: async (config: orderListQuery): Promise<any> => {
    const obj: any = JSON.parse(JSON.stringify(config))
    if (obj.status === 0) delete obj.status
    return $ajax.post(`/api/v1/orders?trace=1`, obj)

  },
  // 详情弹窗
  getDetail: async (config: detailParams): Promise<any> => {
    return $ajax.get(`/api/v1/orders/${config.combined_key}?trace=1`)
  },
  // 取消订单
  cancelOrder: async (config: cancelOrderParams): Promise<any> => {
    return $ajax.post(`/api/v1/orders/cancel`, config)
  },
  // 获取该订单支持的快递公司
  getReservationInfo: async (config: detailParams): Promise<any> => {
    return $ajax.get(`/api/v1/orders/${config.combined_key}/express/reservation-info?trace=1`)
  },
  // 预约快递
  express: async (config: expressParams): Promise<any> => {
    const obj: any = JSON.parse(JSON.stringify(config))
    return $ajax.post(`/api/v1/express?trace=1`, obj)
  },
  exportExpressList: async (config: exportListParams): Promise<any> => {
    const obj: any = JSON.parse(JSON.stringify(config))
    return $ajax.post(`/api/v1/orders/shoppinglist/export`, obj)
  },
  getExportedOrders: async (config: orderHistoryQuery) => {
    const obj:any = JSON.parse(JSON.stringify(config))
    if (!obj.created_time_start) delete obj.created_time_start
    if (!obj.created_time_end) delete obj.created_time_end
    return $ajax.post(`/api/${apiVersion}/orders/manifestHistory/list`, obj)
  },
  getDownloadPdf: async (fileName:string) => {
    return $ajax({
      url: `/api/v1/orders/shippinglist/download?file_name=${fileName}`,
      responseType: "blob",
    })
  },
  // 获取所有未打印快递单信息
  getAllNotPrinted: async (): Promise<any> => {
    return $ajax.get(`/api/v1/verify_express_not_printed_limit`)
  },
  // 批量获取快递单
  getBatchExpress: async (config: expressPrint): Promise<any> => {
    const obj: any = JSON.parse(JSON.stringify(config))
    return $ajax.post(`/api/v1/submit_express_print`, obj)
  },
    
}
export default orderModel