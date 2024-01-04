import { defaultLanguage } from '../config'

const $lan = (obj:any = {}, lan:any):string => {
  const language: string = defaultLanguage|| lan || (navigator.language.toLowerCase().includes('zh') ? 'zh' : navigator.language.toLowerCase())
  
  return obj[language] || '*'
}


export default $lan