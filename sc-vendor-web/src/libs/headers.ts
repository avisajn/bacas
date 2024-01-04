import { comtomsHeader } from '../interface'

const $header = (obj:comtomsHeader):void => {
  const titleEl:any = document.getElementsByTagName('title')
  titleEl[0].innerText = obj.title || 'vendor'
  if (obj.meta) {
    for (const me in obj.meta) {
      const _m = document.createElement('meta')
      _m.setAttribute('name', me)
      _m.setAttribute('content', obj.meta[me])
      document.getElementsByTagName('header')[0].appendChild(_m)
    }
  }
}

export default $header