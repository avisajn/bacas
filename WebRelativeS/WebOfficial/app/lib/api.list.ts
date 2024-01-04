import baseConfig from './config'

const envTag:string = process.env.MODE?.trim() === 'test' ? 'dev': 'prod'

export const changeLogisticStatusApi:string = baseConfig.vendorUrl[envTag] + '/api/v4/express/label'

export const productPreviewApi:string = baseConfig.mokkayaAdminUrl[envTag] + '/api/internal/v1/products/'

export const logisitcLabelDataApi:string = baseConfig.vendorWebUrl[envTag] + '/api/v1/logistics_order/'

export const getUsetBuInviteCodeApi:string = baseConfig.resellerUrl[envTag] + '/api/v1/invite-code/{{invite_code}}/reseller' 

export const getManyLogisticDataApi:string = baseConfig.vendorWebUrl[envTag] + '/api/v1/batch_logistics_order'

export const updateManyLogisticDataApi:string = baseConfig.vendorWebUrl[envTag] + '/api/v1/batch_update_express_label_printed'