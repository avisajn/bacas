export interface productListQuery {
  status?: number | string,
  shopee_url?: string,
  title?: string,
  product_code?: string,
  page_id?: number
}

export interface  productStockQuery {
  produc_id: number | string,
  stock: number
}

