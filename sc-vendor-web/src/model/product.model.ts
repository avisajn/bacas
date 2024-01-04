import $ajax from '../libs/ajax'

import $utils from '../libs/utils'

import { productListQuery,  productStockQuery, productStatusChange } from '../interface/api'

const apiVersion:string = 'v1'

const productModel:any = {
  getProductList: async (config: productListQuery): Promise<any> => {
    const obj:any = JSON.parse(JSON.stringify(config))
    if (obj.status === 0) delete obj.status
    return $ajax.get(`/api/${apiVersion}/products/search${$utils.$quary(obj)}`)
  },
  setProductStock: async (config: productStockQuery):Promise<any> => {
    const obj:any= JSON.parse(JSON.stringify(config))
    if (obj.code) {
      delete obj.code
      return $ajax.post(`/api/${apiVersion}/products/${config.code}`, obj)
    } else {
      return new Error('error code')
    }
  },
  getProductDetail: async (code:string = ''):Promise<any> => {
    if (code) {
      return $ajax.get(`/api/${apiVersion}/products/${code}`)
    } else {
      return new Error('error code format')
    }
  },
  updateProductStatus: async (config: productStatusChange):Promise<any> => {
    return $ajax.post(`/api/${apiVersion}/products/status?trace=1`, config)
  }
}
export default productModel