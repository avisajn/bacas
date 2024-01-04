import { Service } from 'egg';
import promotes from '../lib/promote';
import { remoteConfig, remotePageConfig, logosticData, termPageConfig, expressCompanyItem, nativeLoginPage } from '../interface/home'
import baseConfig from '../lib/config'
import { logisitcLabelDataApi, changeLogisticStatusApi } from '../lib/api.list'
import { $formatMoney } from '../utils'
import $logisticLabel from '../utils/logistic'
import axios from 'axios'
const nodeHtmlToImage = require('node-html-to-image')
// const fs = require('fs')
const path = require('path')
const mammoth = require('mammoth')

const envTag:string = process.env.MODE?.trim() === 'test' ? 'dev': 'prod'

export default class IndexService extends Service {
  // 通过配置文件展示相对应的promote页面
  public async promotePage (key:string):Promise<remotePageConfig | null> {
    const res:remoteConfig | null = promotes[key]
    if (res) {
      let imgs = [] as Array<string>
      if (res.picList) {
        imgs = res.picList
      } else if (res.domainTemp) {
        imgs = '*'.repeat(res.picLength).split('').map((val:string, index:number) => {
          if (val) {
            return res.domainTemp?.replace('#index#', (index + 1).toString()) || ''
          } else {
            return ''
          }
        })
      }
      const showButton:boolean | undefined = this.ctx.query.faq ? false : res.showButton
      const remotaPageData:remotePageConfig = {
        title: res.title,
        imgs,
        showBlock: res.showBlock,
        showButton,
        logKey: res.logKey,
        buttonBg: res.buttonBg || '#fff',
        buttonText: res.buttonText,
        versionKey: res.versionKey
      }
      return remotaPageData
    } else {
      return res
    }
  }

  // 获取promote 所有信息
  public async allPromote ():Promise<Array<any>> {
    return await Promise.all(Object.entries(promotes).map(async (val:any) => {
      const res = await this.service.index.promotePage(val[0]) as any
      res.title = val[0]
      return res
    }))
  }

  // 生成快递数据base 64
  /*
    @id: 快递单号
  */
  public async renderPicture (id:string, onlyHtml: boolean | undefined = false): Promise<string> {
    const url:string = logisitcLabelDataApi + id
    // console.log(new Date().getTime(), 'get_data')
    const curlData:any = await axios({url, method: 'get'})
    // console.log(new Date().getTime(), 'get_data_end')
    const temp:any = curlData.data?.data
    const currentCompany:expressCompanyItem | undefined = baseConfig.expressCompanyMap.find(val => val.id === Number(temp.express_id))
    // console.log(new Date().getTime(), 'get_company')
    if (!currentCompany) {
      return ''
    } else {
      // console.log(new Date().getTime(), 'get_temp')
      const renderFunc:any = $logisticLabel[currentCompany.tag]
      // console.log(new Date().getTime(), 'end_temp')
      if (renderFunc) {
        // console.log(new Date().getTime(), 'start_render')
        const html:string = await renderFunc(temp)
        // console.log(new Date().getTime(), 'end_render')
        // console.log(new Date().getTime(), 'start_return')
        return !onlyHtml ? await nodeHtmlToImage({
          html,
          encoding: 'base64',
          puppeteerArgs: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        }) : 
        await renderFunc(temp)
      } else {
        return ''
      }

    }
  }

  // 生成pdf 用的html
  /*
    @data: 接口快点返回通用数据
  */
  public async renderPdf (data:any):Promise<string> {
    const currentCompany:expressCompanyItem | undefined = baseConfig.expressCompanyMap.find(val => val.id === Number(data.express_id))
    if (!currentCompany) {
      return ''
    } else {
      const renderFunc:any = $logisticLabel[currentCompany.tag]
      const html:string = await renderFunc(data)
      return html
    }
  }

  // 通过接口回去快递单信息
  /*
    @id: 快递单号
  */
  public async getLogisticData (id:string):Promise<{formData: logosticData | null, skus: Array<any>} | object> {
    const url:string = logisitcLabelDataApi + id
    const curlData:any = await this.ctx.curl(url, { dataType: 'json', timeout: 30000 })
    const apiUrl = changeLogisticStatusApi
    if (curlData && curlData.data && curlData.data.data) {
      if (curlData.data.data.user_payment_type === 3) {
        // add test
        if (curlData.data.data.express_id === 2) {
          curlData.data.data.cod_label = `Rp ${$formatMoney(curlData.data.data.cod_price ? curlData.data.data.cod_price.toString() : '')}`
        } else {
          curlData.data.data.cod_label = `COD: Rp. ${$formatMoney(curlData.data.data.cod_price ? curlData.data.data.cod_price.toString() : '')},-`
        }
      } else {
        curlData.data.data.cod_label = `NON COD`
      }
      if (curlData.data.data.insurance_price) curlData.data.data.show_insurance_price = $formatMoney(curlData.data.data.insurance_price.toString())
      const skus:Array<any> = curlData.data.data.sku_details.map((val:any) => {
        const detail = Object.values(val.sku_properties || {}).join(', ')
        return {product_title: val.product_title, detail: detail === '-' ? '' : detail, amount: val.amount}
      })
      return {apiUrl, formData: curlData.data.data as logosticData, skus,  logKey: baseConfig.resellerAppGTag[envTag]}
    } else {
      return {formData: null, skus: []}
    }
  }

  // 通过指定的key获取相关协议内容
  /*
    @urlKey: url中对应的文档地址
  */
  public async getTerm (urlKey:string):Promise<termPageConfig | null> {
    return baseConfig.termConfig[urlKey] || null
  }

  // 测试方法，word 转 html
  public async formatTerm ():Promise<string> {
    const sr:any = await mammoth.convertToHtml({includeEmbeddedStyleMap: true, path: path.resolve(__dirname, '../terms/demo.docx')})
    console.log(sr)
    return sr.value || ''
  }

  // 获取所有视频
  public async getAllVideo ():Promise<Array<any>> {
    const videoJson:Array<any> = require('../lib/video.json')
    return videoJson
  }

  // 原生登陆中转
  public async nativeLogin ():Promise<nativeLoginPage> {
    const { ctx } = this
    const code:string = ctx.params.code
    console.log(ctx.URL)
    const location:any = ctx.URL
    // console.log(location.href.replace(location.protocol, '').replace())
    const url:string = location.href.replace(location.protocol, '').replace('/', '').replace('/', '')
    const gtag:string = baseConfig.resellerAppGTag[envTag]
    return {
      code,
      url,
      gtag
    }
  }

  // 老用户召回中间页
  public async oldCustomerCallBack ():Promise<nativeLoginPage> {
    const { ctx } = this
    const code:string = ctx.query.trace_from
    const location:any = ctx.URL
    // console.log(location.href.replace(location.protocol, '').replace())
    const url:string = location.href.replace(location.protocol, '').replace('/', '').replace('/', '')
    const gtag:string = baseConfig.resellerAppGTag[envTag]
    return {
      code, url, gtag
    }
  }
}
