import { Controller } from 'egg';
import { remotePageConfig, termPageConfig, sharePageInfo, expressCompanyItem, productInfo, nativeLoginPage } from '../interface/home';
import Config from '../lib/config'
const Duplex = require('stream').Duplex
const path = require('path')
const fs = require('fs')

export default class HomeController extends Controller {
  // 首页展示
  public async index() {
    const { ctx } = this;
    const ua:string = ctx.request.header['user-agent'] || ''
    const isMobil:RegExp = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    await ctx.render(isMobil.test(ua) ? 'index/mobile-amp.ejs' : 'index/pc-amp.ejs')
  }
  // 展示非amp官网
  public async originIndex () {
    const { ctx } = this
    const pageTemp:string = ctx.URL.href.includes('pc') ? 'index/pc.ejs' : 'index/mobile.ejs'
    await ctx.render(pageTemp)
  }
  // promote页展示
  public async promote():Promise<void> {
    const promoteKey:string = this.ctx.URL.pathname.replace('/', '')
    const promoteData:remotePageConfig | null = await this.service.index.promotePage(promoteKey)
    if (promoteData) {
      const target_url:string = promoteKey.includes('6') ? 'https://mokkaya.com/webapp/share_material' : ''
      await this.ctx.render('promote/promote.temp.ejs', {...promoteData, target_url})
    } else {
      await this.ctx.render('404.ejs', {msg: 'promote not found', code: 12404})
    }
  }
  // 所有promote 信息
  public async allPromote () {
    await this.ctx.render('promote/manager.ejs', { arr: await this.ctx.service.index.allPromote() })
  }

  // 下载物流信息图片
  public async downloadLogisticPicture () {
    const { ctx } = this
    const id:string = ctx.params.id || ''
    if (!id) {
      ctx.render('500.ejs', {code: 13401, msg: 'invilid logisitc number'})
    } else {
      try {
        const dataStr:string = await ctx.service.index.renderPicture(id)
        if (dataStr) {
          this.ctx.attachment(`${id}.png`);
          ctx.set('Content-Type', 'application/octet-stream');
          // console.log(new Date().getTime(), 'start_buffer')
          const dataBuffer:Buffer = Buffer.from(dataStr, 'base64')
          let picData:any = new Duplex()
          picData.push(dataBuffer)
          picData.push(null)
          ctx.body = picData
        } else {
          ctx.render('500.ejs', { code: 13402, msg: 'network error' })
        }
      } catch (err) {
        const error = err as any
        ctx.body = {
          success: false, error: error.message, msg: JSON.stringify(error)
        }
      }
    }
  }

  // 物流页展示
  public async logisitic ():Promise<void> {
    const id:string = this.ctx.params.id
    const data:any = await this.service.index.getLogisticData(id)
    // 有c 20， 无c 19
    const combinedKey:string = data.formData.combined_key || ''
    if (!combinedKey) {
      await this.service.warning.sendLarkMessage(`express label error catching: env: ${process.env.MODE?.trim()} | express_id: ${id} | no combined_key`)
    } else if (combinedKey.includes('C') && combinedKey.length > 20) {
      await this.service.warning.sendLarkMessage(`express label error catching: env: ${process.env.MODE?.trim()} | express_id: ${id} | combined_key: ${combinedKey}`)
    } else if (!combinedKey.includes('C') && combinedKey.length > 19) {
      await this.service.warning.sendLarkMessage(`express label error catching: env: ${process.env.MODE?.trim()} | express_id: ${id} | combined_key: ${combinedKey}`)
    }
    // if (data.formData.combined_key && data.formData.combined_key.length)
    if (data.formData) {
      const logositicsList:Array<expressCompanyItem> = Config.expressCompanyMap
      const currentId:number | undefined = Number(this.ctx.query.express_id) || Number(data.formData.express_id)
      if (!currentId) {
        await this.ctx.render('500.ejs', {code: 13407, msg: 'logistic company error'})
      } else {
        const current:expressCompanyItem | undefined = logositicsList.find((val: expressCompanyItem) => val.id === currentId)
        // console.log(current)
        if (!current) {
          await this.ctx.render('500.ejs', {code: 13408, msg: 'logistic company id error'})
        } else {
          const renderPath:string = current.template
          await this.ctx.render(renderPath, {...data, dataSource: JSON.stringify(data)})
        }
      }
    } else {
      await this.ctx.render('500.ejs', {code: 13405, msg: 'logistic data error'})
    }
  }

  // 协议相关
  public async terms ():Promise<void> {
    const url:string = this.ctx.URL.pathname.replace('/', '')
    const termPage:termPageConfig | null = await this.ctx.service.index.getTerm(url)
    if (termPage) {
      await this.ctx.render(termPage.temp, {title: termPage.title, googleTag: termPage.googleTag})
    } else {
      await this.ctx.render('/404', { msg: 'error terms', code: 14001 })
    }
  }
  
  // 部分唤起原生app 功能
  public async orderNatice ():Promise<void> {
    await this.ctx.render('native/order.ejs')
  }
  
  // 部分唤起原生app 功能
  public async links ():Promise<void> {
    await this.ctx.render('native/link.ejs')
  }

  // vendor 图片文档
  public async supplierpolicy () {
    await this.ctx.render('terms/vendor/supplierpolicy.ejs')
  }

  // 分享邀请链接
  public async share2invite () {
    const { ctx } = this
    const code:string = ctx.URL.pathname.replace('/', '')
    const pageData:sharePageInfo | null = await this.ctx.service.share.page(code)
    if (pageData && pageData.name && pageData.uid) {
      await ctx.render('share/index.ejs', pageData)
    } else {
      await ctx.render('404.ejs', {code: 15001, msg: pageData || 'Link undangan tidak valid'})
    }
  }

  // 生成邀请图片，返回buffer 浏览器直接打开  非下载
  public async shareImage () {
    const { ctx } = this
    const code:string = this.ctx.params.code.replace('.png', '')
    const imgData:string | null = await this.service.share.makeSharePicture(code)
    if (imgData) {
      ctx.set('Content-Type', 'image/png')
      const dataBuffer:Buffer = Buffer.from(imgData, 'base64')
      ctx.body = dataBuffer
    } else {
      ctx.render('404.ejs', {code: 15002, msg: 'invalid invitor name'})
    }
  }

  // 根据邀请码生成Google store 链接
  public async shareGoogleUrl () {
    await this.ctx.render('share/url.ejs')
  }

  // 网站site map重定向
  public async sitemap () {
    const pathDir:string = path.resolve(__dirname, '../public/sitemap.xml')
    // this.ctx.attachment(pathDir)
    this.ctx.set('Content-Type', 'application/xml')
    this.ctx.body = fs.readFileSync(pathDir, 'utf-8')
  }

  // 网站robot.txt 重定向
  public async robot () {
    const pathDir:string = path.resolve(__dirname, '../public/robots.txt')
    this.ctx.body = fs.readFileSync(pathDir, 'utf-8')
  }

  // 根据商品code 展示商品cover_image
  public async shareProductPreview () {
    const code:string = this.ctx.params.code
    const detail:productInfo | null = await this.ctx.service.reseller.fetchProductPreview(code)
    if (detail) {
      await this.ctx.render('share/product.ejs', { detail })
    } else {
      await this.ctx.render('404.ejs', { code: 200123, msg: 'invalid code'})
    }
  }

  // wa 登陆中间页渲染
  public async loginSchame () {
    const data:nativeLoginPage = await this.service.index.nativeLogin()
    await this.ctx.render('native/login.ejs', data)
  }

  // 用户召回中间页渲染
  public async oldCallback () {
    const data:nativeLoginPage = await this.service.index.oldCustomerCallBack()
    await this.ctx.render('native/callback.ejs', data)
  }

  // local 调查问卷列表
  public async localSurveyList () {
    const { ctx } = this
    const list:Array<string> = await this.service.survey.listLocalSurveys()
    console.log(ctx.URL)
    const urls:Array<string> = list.map(val => ctx.URL.href + `/${val}`)
    await ctx.render('survey/index.ejs', { urls })
    // ctx.body = list
  }

  // 动态展示 survey 问卷
  public async getSurveyPage () {
    const { ctx } = this
    try {
      const _id:string = ctx.params.id
      const data:any = await this.service.survey.getLocalOneSurvey(_id, true)
      const from:string = ctx.query._f || ''
      if (data && from) {
        await ctx.render('survey/_id.ejs', { info: JSON.stringify(data), pageTitle: data.title, _id, requestUrl: data.apiUrl, logKey: data.logKey })
      } else {
        await ctx.render('404.ejs', { code: 40004, msg: 'survey not found' })
      }
    } catch (err) {
      console.log(err)
      await this.ctx.render('500.ejs', {code: 50404, msg: 'faild survey data'})
    }
  }

  // 返回调查问卷json
  public async getSurveyJSON () {
    const { ctx } = this
    try {
      const _id:string = ctx.params.id
      const data:any = await this.service.survey.getLocalOneSurvey(_id)
      ctx.body = {
        code: 0,
        sucess: true,
        data
      }
    } catch (err) {
      ctx.body = {
        code: 400004,
        msg: 'survey not found',
        sucess: false,
      }
    }
  }

  // 获取请求的ip
  public async getIp () {
    const ip:string = this.ctx.ip
    const headers:any = this.ctx.headers
    const x_forwarded_for:any = this.ctx.get('X-Forwarded-For')
    console.log()
    const rip:string = this.ctx.request.ip
    const ips:Array<string> = this.ctx.ips
    this.ctx.body = {
      code: 0,
      data: {
        ip, ips, rip, x_forwarded_for, headers
      }
    }
  }
  // 404
  public async notFound ():Promise<void> {
    await this.ctx.render('404.ejs', { code: false, msg: this.ctx.URL.href})
  }

  // 50x
  public async error ():Promise<void> {
    await this.ctx.render('500.ejs', {code: 99999, msg: 'error'})
  }
}
