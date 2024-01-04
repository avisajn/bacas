import { Service } from 'egg'
import { $stream2Buffer } from '../utils'
import { getManyLogisticDataApi } from '../lib/api.list'
import axios from 'axios'
import $store from '../store'
import $table from '../store/table'
import * as uuid from 'uuid'
import { TableQuery } from 'azure-storage'
const nodePdf = require('html-pdf-node')
const azure = require('azure-storage');
import baseConfig from '../lib/config'
const envTag: string = process.env.MODE?.trim() === 'test' ? 'dev' : 'prod'

export default class pdfService extends Service {
  // 创建pdf
  async createOnePdf(content: string): Promise<Buffer> {
    const res: Buffer = await nodePdf.generatePdf({ content: content.replace(/[\r\n]/g, '') }, {
      margin: { top: '10px', bottom: '10px' },
      displayHeaderFooter: false,
      // headerTemplate : `<div style="padding:0 20px; font-size: 10px; color: #666;">MOKKAYA SUPPLIER</div>`,
      // footerTemplate: `<div style="padding: 0 20px; font-size: 10px; color: #666;"><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      format: 'A4',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    return res
  }

  // 上传combined_key 索引
  async uploadPdfInfo(data: any): Promise<any> {
    const container: any = await $store('express-pdf-label')
    const id: string = uuid.v1();
    const fileName: string = `${id}.json`
    let blob: any = await container.getBlockBlobClient(fileName)
    const res = await blob.upload(JSON.stringify(data), JSON.stringify(data).length)
    return { res, id }
  }

  // async createTableData(data: any): Promise<any> {
  //   const result = await this.queryTableEntities(data)
  //   // console.log('result, ', result)
  //   return result
  // }

  // 添加combined_key
  async createTableData(data: any): Promise<any> {
    const storageKey:Array<string> = baseConfig.azureStorage[envTag].split(';')
    let name:string = ''
    let accessKey:string = ''
    storageKey.forEach((item:string) => {
      if (item.indexOf('AccountName=') > -1) {
        name = item.split('AccountName=')[1]
      }
      if (item.indexOf('AccountKey=') > -1) {
        accessKey = item.split('AccountKey=')[1]
      }
    })
    const tableSvc: any = azure.createTableService(name, accessKey);
    const tableQuery = new TableQuery().where('ids eq ? and vendor_id eq ? ', data.ids.join(','), data.vendor_id);
    const table: any = await $table('LogisticLabelLog');

    return new Promise(resolve => {
      tableSvc.queryEntities('LogisticLabelLog', tableQuery, null, async (error: any, result: any) => {
        console.log('error', error)
        if (!error) {
          const arr = result.entries.filter(i => i.vendor_id._ === data.vendor_id && data.ids.join(',') === i.ids._);
          if (arr.length) {
            const inner:any = {}
            for (const i in arr[0]) {
              inner[i] = arr[0][i]['_'] || arr[0][i]['etag']
            }
            resolve({ res: inner, id: inner.RowKey });
          } else {
            const row: any = {};
            row.ids = data.ids.join(',');
            row.vendor_id = data.vendor_id;
            row.create_time = parseInt(data.create_time);
            const id: string = uuid.v1();
            row.PartitionKey = id;
            row.rowKey = id;
            resolve({ res: await table.createEntity(row), id });
          }
        } else {
          const row: any = {};
          row.ids = data.ids.join(',');
          row.vendor_id = data.vendor_id;
          row.create_time = parseInt(data.create_time);
          const id: string = uuid.v1();
          row.PartitionKey = id;
          row.rowKey = id;
          resolve({ res: await table.createEntity(row), id });
        }
      })
    });
  }
  // 根据快递公司生成表格 html
  async CreateLogisticLabel(data: Array<any>): Promise<string> {
    const info: Array<string> = await Promise.all(data.map((val: any) => this.ctx.service.index.renderPdf(val)))
    return info.join('')
  }

  // 通过索引获取 combined_key
  async getIdFromStorage(): Promise<any> {
    const { ctx } = this
    const container: any = await $store('express-pdf-label')
    const fileName: string = `${ctx.params.id}.json`
    let blob: any = await container.getBlobClient(fileName)
    const data: any = await blob.download();
    const buf: Buffer = await $stream2Buffer(data.readableStreamBody)
    const idInfo: any = JSON.parse(buf.toString())
    return idInfo
  }

  // 通过索引获取 combined_key
  async getTableData(): Promise<any> {
    const table: any = await $table('LogisticLabelLog')
    // const datas:Array<any> = await table.listEntities()
    const id: string = this.ctx.params.id
    const row: any = await table.getEntity(id, id)
    // console.log(row)
    if (row.ids) {
      const idInfo: any = {
        id: row.id,
        ids: row.ids.split(','),
        vendor_id: row.vendor_id
      }
      return idInfo
    } else {
      return null
    }
  }

  // 根据combined_key  获取数据
  async fetchLogisticData(combined_ids: Array<number>): Promise<any> {
    return await axios({
      url: getManyLogisticDataApi,
      method: 'post',
      data: {
        combined_ids
      }
    })
  }
}