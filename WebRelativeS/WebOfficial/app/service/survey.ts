import { Service } from 'egg'
import $store from '../store'
import { $stream2Buffer } from '../utils'
import { v1 as uuid }  from 'uuid'

const path = require('path')
const fs = require('fs')
import Config from '../lib/config'

const surveyContainerName = 'survey-question-data'
const setSurveyBlobName:Function = (id:string = ''):string =>  `0118/${id}.json`


const envTag:string = process.env.MODE?.trim() === 'test' ? 'dev': 'prod'

export default class SurveyService extends Service {
  // 返回本地所有貂蝉问卷 文件名
  public async listLocalSurveys ():Promise<Array<string>> {
     const dirs:Array<string> = fs.readdirSync(path.resolve(`./app/lib/survey`))
     return dirs.map(val => val.replace('.js', ''))
  }

  // 返回本地文件存储的问卷json
  public async getLocalOneSurvey (_id:string = '', needApi:boolean | void = false):Promise<any> {
    try {
      const targetDataPaht:string = path.resolve('./app/lib/survey', `${_id}.js`)
      const data = require(targetDataPaht)
      if (needApi) {
        data.apiUrl = Config.resellerUrl[envTag]
        data.logKey = Config.resellerAppGTag[envTag]
      }
      return data
    } catch {
      return null
    }
  }

  // 返回container 下所有blob
  public async listSurveys ():Promise<Array<string>> {
    const container:any = await $store(surveyContainerName)
    const blobs:Array<any> = container.listBlobsFlat();
    const arr:Array<string> = []
    for await (const blob of blobs) {
      const str:string = await this.service.survey.getOneSurvey(setSurveyBlobName(blob.name))
      arr.push(str)
    }
    return arr
  }

  // 获取 单个blob文件
  public async getOneSurvey (id: string = ''):Promise<string> {
    if (id) {
      const container:any = await $store(surveyContainerName)
      const fileName = setSurveyBlobName(id)
      const _b:any = container.getBlobClient(fileName);
      const cur:any = await _b.download();
      const buf:Buffer = await $stream2Buffer(cur.readableStreamBody)
      return buf.toString()
    } else {
      return ''
    }
  }

  // 添加/修改 blob（文件）
  public async setOneServey (content: string = '', id:unknown = ''):Promise<boolean> {
    if (content) {
      const container = await $store(surveyContainerName)
      const fileName:string = setSurveyBlobName(id || uuid())
      let blob:any = await container.getBlockBlobClient(fileName)
      const res:any = await blob.upload(content, content.length)
      return res.contentMD5 ? true : false
    } else {
      return false
    }
  }

  // 删除blob 文件
  public async deleteOneServey (id:string = ''):Promise<boolean | any> {
    const container:any = await $store(surveyContainerName)
    const fileName:string = setSurveyBlobName(id)
    const res = await container.deleteBlob(fileName)
    return res
  }
}