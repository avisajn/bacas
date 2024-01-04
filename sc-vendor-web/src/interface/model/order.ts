export interface orderListQuery {
  status?: number | string,
  page_id?: number,
  size?:number,
  from_search?: boolean,
  hours_to_cancel_max?: number,
  product_code?: any,
  product_title?: string,
  combined_key?: string | number,
  created_time_min?: number | string,
  created_time_max?: number | string,
  process_status?: number,
  express_no?: string | number,
  express_company_id?: number | string,
  delivery_time_min?: number | string,
  delivery_time_max?: number | string,
  express_label_printed?: boolean,
  sort_direction?:any,
  express_picked_up?: boolean, 
}
export interface cancelOrderParams {
  combined_key: string,
  code: number | string,
  etag: string,
  stock: {
    [key: string]: number
  }
}
export interface detailParams {
  combined_key: any
}
// 预约快递
export interface expressParams {
  express_id:any, 
  combined_key?: string,
  location_id?: any,
  detail?: any,
  name?: string,
  phone_number?: string,
}
// 批量导出发货清单
export interface exportListParams {
  combined_keys: Array<string>,
}

export interface productStatusChange {
  status: number,
  codes: Array<string>
}


export interface orderHistoryQuery {
  page: number,
  page_size: number,
  order_no?: string,
  created_time_start?: number,
  created_time_end?: number
}
export interface expressPrint {
  combined_ids: Array<number>,
  all_not_print: Boolean
}

