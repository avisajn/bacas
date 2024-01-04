import { Controller } from "egg";
import { expressItem } from '../interface/adminApi'

export default class adminApi extends Controller {
  // 获取原生物流运费相关
  async nativeSicPrice () {
    const { ctx } = this
    if (!ctx.query.start_code || !ctx.query.end_code || !ctx.query.weight) {
      ctx.body = {
        code: 7000001,
        mes: `invalid data`
      }
    } else {
      const config:expressItem = {
        start_code: ctx.query.start_code,
        end_code: ctx.query.end_code,
        weight: ctx.query.weight
      }
      const data:any = await ctx.service.logistic.nativeSicPrice(config)
      ctx.body = {
        code: 0,
        ...data
      }
    }
  }
  // 获取原生物流运费相关
  async nativeSapPrice () {
    const { ctx } = this
    if (!ctx.query.start_code || !ctx.query.end_code || !ctx.query.weight) {
      ctx.body = {
        code: 7000002,
        mes: `invalid data`
      }
    } else {
      const config:expressItem = {
        start_code: ctx.query.start_code,
        end_code: ctx.query.end_code,
        weight: ctx.query.weight
      }
      const data:any = await ctx.service.logistic.nativeSapPrice(config)
      ctx.body = {
        code: 0,
        data
      }
    }
  }
}