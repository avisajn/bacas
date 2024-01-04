
import BASECONFIG from '../baseConfig.json';
const envTag:any = process.env.REACT_APP_ENV_TAG


export const baseURL:string =  BASECONFIG.base_url[envTag]
export const domain:string =  BASECONFIG.resellerDomain[envTag]
export const serviceWA:string = BASECONFIG.service_whatsapp
export const waUrl:string = BASECONFIG.whatsapp_url
export const defaultLanguage:string = BASECONFIG.defaultLanguage[envTag]
export const logisiticDomain:string = BASECONFIG.logisiticDomain[envTag]


