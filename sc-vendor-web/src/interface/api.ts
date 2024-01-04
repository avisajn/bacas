export interface productListQuery {
  status?: number | string,
  shopee_url?: string,
  product_title?: string,
  product_code?: string,
  page_id: number,
  page_size: number
}

export interface  productStockQuery {
  produc_id: number | string,
  stock: number,
  code: string
}

export interface orderListQuery {
  status?: number | string,
  page_id?: number,
  product_id?: number | string,
  product_title?: string,
  order_no?: number,
  created_time?: any,
  process_status?: number,
  logistics_number?: number | string,
  logisitcs_company?: number| string,
  pick_up_time?: any,
  refund_list?: boolean,
}

export interface cancelOrderParams {
  combined_key: string,
  code: number | string,
  etag: string,
  stock: {
    [key: string]: number
  }
}

export interface productStatusChange {
  status: number,
  codes: Array<string>
}