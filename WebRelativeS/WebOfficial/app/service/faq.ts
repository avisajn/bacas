import { Service } from 'egg';
const $fromatNumber = require('../utils/faq/fotmatNumber.js');
const $formatProduct = require('../utils/faq/fromatProduct.js');
const $fromatOrderStatus = require('../utils/faq/formatOrderStatus.js');
const $formatOrder = require('../utils/faq/formatOrder.js');

interface faqResponse {
  state: string,
  content: string
}

export default class FaqService extends Service {
  async $number (str: string | undefined):Promise<faqResponse> {
    return $fromatNumber(str)
  }
  async fetchProduct (id: string):Promise<string> {
    const token:string | undefined = this.ctx.get('Authorization')
    if (!token) {
      return ''
    } else {
      const res:any = await this.ctx.curl(`https://test.api.mokkaya.com/api/v1/products/${id}`, {
        headers: {
          "Authorization": token
        },
        dataType: 'json'
      })
      // console.log(res)
      return JSON.stringify(res)
    }

  }
  async formatProduct (JSONStr:string):Promise<faqResponse> {
    return $formatProduct(JSONStr)
  }
  async fetchOrder (id: string):Promise<string> {
    const token:string | undefined = this.ctx.get('Authorization')
    if (!token) {
      return ''
    } else {
      const res:any = await this.ctx.curl(`https://test.api.mokkaya.com/api/v1/private/orders/${id}`, {
        headers: {
          "Authorization": token
        },
        dataType: 'json'
      })
      // console.log(res)
      return JSON.stringify(res)
    }

  }

  async formatOrderStatus (JSONStr: string):Promise<faqResponse> {
    return $fromatOrderStatus(JSONStr)
  }

  async formatOrder (JSONStr: string):Promise<faqResponse> {
    return $formatOrder(JSONStr)
  } 
}