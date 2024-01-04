import { Service } from 'egg'
import axios from 'axios'

export default class WarningService extends Service {
  public async sendLarkMessage (message: string):Promise<any> {
    return await axios({
      url: 'https://lark.newsinpalm.net/notification/group',
      method: 'POST',
      data: {
        message_type: 0,
        text: message,
        metioned_user_name: [],
        metioned_user_email: [
          "zuoming@newsinpalm.com",
          "jinhang@newsinpalm.com"
        ],
        group_name: "mokkaya服务报警"
      }
    })
    
  }
}