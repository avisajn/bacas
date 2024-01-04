import { Controller } from 'egg';

export default class FaqContrller extends Controller {
  async number () {
    const _format:string | undefined = this.ctx.query.number
    if (!_format) {
      this.ctx.body = {
        success: false,
        err_msg: 'invalid query [number]'
      }
    } else {
      this.ctx.body = {
        success: true,
        data: await this.service.faq.$number(_format)
      }
    }
  }

  async formatProduct () {
    const id = this.ctx.query.id
    if (!id) {
      this.ctx.body = {
        success: false,
        err_msg: 'invalid query [id]'
      }
    } else {
      const res:string = await this.service.reseller.fetchProduct(id)
      if (!res) {
        this.ctx.body = {
          success: false,
          msg: 'invaild token'
        }
      } else {
        this.ctx.body = {
          success: true,
          data: await this.service.faq.formatProduct(res)
        }
      }

    }
  }

  async formatOrderStatus () {
    const id = this.ctx.query.id
    if (!id) {
      this.ctx.body = {
        success: false,
        err_msg: 'invalid query [id]'
      }
    } else {
      const res:string = await this.service.reseller.fetchOrder(id)
      if (!res) {
        this.ctx.body = {
          success: false,
          msg: 'invalid token'
        }
      } else {
        this.ctx.body = {
          success: true,
          data: await this.service.faq.formatOrderStatus(res)
        }
      }
    }
  }


  async formatOrder () {
    const id = this.ctx.query.id
    if (!id) {
      this.ctx.body = {
        success: false,
        err_msg: 'invalid query [id]'
      }
    } else {
      const res:string = await this.service.reseller.fetchOrder(id)
      if (!res) {
        return {
          success: false,
          msg: 'invalid token'
        }
      } else {
        this.ctx.body = {
          success: true,
          data: await this.service.faq.formatOrder(res)
        }
      }
    }
  }
}