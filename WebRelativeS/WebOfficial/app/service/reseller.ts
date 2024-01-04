import { Service } from 'egg'
// import { $query } from '../utils'
import baseConfig from '../lib/config'
import { productInfo } from '../interface/home'
import { productPreviewApi, getUsetBuInviteCodeApi } from '../lib/api.list'

const apiTemp:string = process.env.MODE?.trim() === 'prod' ? baseConfig.resellerUrl['prod'] : baseConfig.resellerUrl['dev']


export default class ResellerService extends Service {
  async user (obj: any):Promise<any> {
    if (obj && obj.invite_code) {
      const { ctx } =  this
      try {
        const url:string = getUsetBuInviteCodeApi.replace('{{invite_code}}', obj.invite_code)
        const res = await ctx.curl(url, { dataType: 'json', timeout: 30000 })
        if (res && res.data && res.data.success) {
          return res.data.data
        } else {
          return false
        }
      } catch (error) {
        return error
      }
    } else {
      return false
    }
  }
  async fetchProduct (id: string):Promise<string> {
    const token:string | undefined = this.ctx.get('Authorization')
    if (!token) {
      return ''
    } else {
      const res:any = await this.ctx.curl(`${apiTemp}/api/v1/products/${id}`, {
        headers: {
          "Authorization": token
        },
        dataType: 'json'
      })
      // console.log(res)
      return JSON.stringify(res)
    }

  }
  async fetchOrder (id: string):Promise<string> {
    const token:string | undefined = this.ctx.get('Authorization')
    if (!token) {
      return ''
    } else {
      const res:any = await this.ctx.curl(`${apiTemp}/api/v1/private/orders/${id}`, {
        headers: {
          "Authorization": token
        },
        dataType: 'json'
      })
      // console.log(res)
      return JSON.stringify(res)
    }

  }
  async fetchProductPreview (code:string):Promise<productInfo | null> {
    const url:string = productPreviewApi + code
    try {
      const res:any = await this.ctx.curl(url, { dataType: 'json', method: 'POST' })
      if (res.data && !res.data.code) {
        return {
          code,
          title: res.data.data.title,
          cover_image: res.data.data.cover_image
        } 
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }

    // return {
    //   code,
    //   title: 'New MOTIF Baru !! Celemek Makan Bayi Baby BIB Slabber Full Silikon VECM-578',
    //   cover_image: 'https://mokkayatest.blob.core.windows.net/mark-spu-images/dd8f9da0-35b8-4ba1-b263-a523948fa63d',
    //   current_price: 29000
    // }
  }
}