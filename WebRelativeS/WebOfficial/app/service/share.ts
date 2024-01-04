import { Service } from 'egg'
import { sharePageInfo } from '../interface/home'
import baseConfig from '../lib/config'
import renderSharePicture from '../utils/render_share'
const nodeHtmlToImage = require('node-html-to-image')


export default class ShareService extends Service {
  // 返回渲染网页所需要对应内容
  async page (invite_code: string):Promise<sharePageInfo | null> {
    const data:any = await this.service.reseller.user({ invite_code })
    if (data) {
      const uid:string = data.id
      const name:string = data.name
      const dim:string =  process.env.MODE?.trim() === 'prod' ? baseConfig.domainUrl['prod'] : baseConfig.domainUrl['dev']
      const gaTag:string =  process.env.MODE?.trim() === 'prod' ? baseConfig.resellerAppGTag['prod'] : baseConfig.resellerAppGTag['dev']
      return { uid, name, dim, code: invite_code, gaTag }
    } else {
      return null
    }
  }

  /*
    根据code 生成对应
    @code: 邀请码，无校验，非空
  */
  async makeSharePicture(code: string):Promise<string | null> {
    if (!code) {
      return null
    } else {
      const html = renderSharePicture(code)
      // return html
      return await nodeHtmlToImage({html, encoding: 'base64', puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }})
    }

  }
}