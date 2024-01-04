import { Service } from 'egg'
import { expressItem } from '../interface/adminApi'

export default class logisticService extends Service {
  async nativeSicPrice (data:expressItem):Promise<any> {
    const res:any = await this.ctx.curl(`http://apitrek.sicepat.com/customer/tariff?origin=${data.start_code}&destination=${data.end_code}&weight=${data.weight}`, {
      dataType: 'json',
      headers: {
        'api-key': '6dba3d67e038559058f162e62999f1c1'
      }
    })
    return res
  }
  async nativeSapPrice (data:expressItem) {
    console.log({
      origin: data.start_code,
      destination: data.end_code,
      weight: data.weight
    })
    const res:any = await this.ctx.curl(`https://api.coresyssap.com/master/shipment_cost/publish`, {
      method: 'POST',
      dataType: 'json',
      headers: {
        'api-key': 'global',
        "Content-Type": "application/json"
      },
      data: {
        origin: data.start_code,
        destination: data.end_code,
        weight: data.weight
      }
    })
    return res
  }
}