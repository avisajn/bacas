import { Controller } from 'egg'
const Duplex = require('stream').Duplex
import { updateManyLogisticDataApi } from '../lib/api.list'
import baseConfig from '../lib/config'
const envTag: string = process.env.MODE?.trim() === 'test' ? 'dev' : 'prod'



export default class pdfController extends Controller {
  // 上传pdf combind_key 索引
  async setLabelNumber() {

    try {
      console.log(this.ctx.request.body)
      const ids: Array<number> = this.ctx.request.body.ids
      const vendor_id: string = this.ctx.request.body.vendor_id
      const data = {
        ids,
        vendor_id,
        create_time: Number(new Date().getTime() / 1000),
      }
      const { res, id } = await this.ctx.service.pdf.createTableData(data)
      this.ctx.body = res.requestId || res['.metadata'] ? {
        code: 0,
        success: true,
        url: `${baseConfig.domainUrl[envTag]}/logistics/pdf/${id}`
      } : {
        code: 100000,
        suceess: false,
      }
    } catch (error) {
      console.log(error)
      this.ctx.body = {
        code: 600012,
        success: false,
        msg: JSON.stringify(error)
      }
    }

  }

  // 获取 pdf html
  async getHtmlFromId() {
    const { ctx } = this
    try {
      const idInfo: any = await this.service.pdf.getTableData()
      const logisticArr: any = await this.ctx.service.pdf.fetchLogisticData(idInfo.ids)
      const html: string = await this.ctx.service.pdf.CreateLogisticLabel(logisticArr.data?.data)
      await ctx.render('logistic/many.ejs', { vendor_id: idInfo.vendor_id, logKey: baseConfig.resellerAppGTag[envTag], apiUrl: updateManyLogisticDataApi, ids: idInfo.ids, html: html.replace(/[\r\n]/g, '') })
      // await ctx.render('logistic/many.ejs', { vendor_id: idInfo.vendor_id, logKey: baseConfig.resellerAppGTag[envTag], apiUrl: updateManyLogisticDataApi, ids: idInfo.ids, html: html.replace(/[\r\n]/g, '')})
    } catch (error) {
      console.log(error)
      await ctx.render('404.ejs', { code: 60014, msg: JSON.stringify(error) })
    }
  }

  // 下载pdf
  async getPdfFromId() {
    const { ctx } = this
    try {
      const ids: Array<number> = this.ctx.request.body.ids
      // console.log('fetchData', new Date().getTime())
      const logisticArr: any = await this.ctx.service.pdf.fetchLogisticData(ids)
      // console.log('renderHtml', new Date().getTime())
      const html: string = await this.ctx.service.pdf.CreateLogisticLabel(logisticArr.data?.data)
      // console.log('renderpdf', new Date().getTime())
      const fileBuffer: Buffer = await this.ctx.service.pdf.createOnePdf(html)
      // console.log('endRender', new Date().getTime())
      ctx.set('Content-Type', 'application/pdf')
      let picData: any = new Duplex()
      picData.push(fileBuffer)
      picData.push(null)
      ctx.body = picData
    } catch (error) {
      console.log(error)
      await ctx.render('500.ejs', { code: 60015, msg: JSON.stringify(error) })
    }
  }
}