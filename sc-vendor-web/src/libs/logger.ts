import $utils from "./utils"

const $logger = (firebase:any) => {
  return (eventName:string, eventParams:any = {}) => {
    eventParams.user_id = localStorage.getItem('user_id')
    eventParams.email = localStorage.getItem('user_email')
    eventParams.user_name = localStorage.getItem('user_name')
    eventParams.from = 'pc'
    eventParams.send_timestamp = new Date().getTime()
    const localData:string = localStorage.getItem('google_log') as string
    const googleTable:any = localStorage.getItem('google_log') ? JSON.parse(localData) : {}
    const table = googleTable[eventName] || []
    table.push(eventParams)
    googleTable[eventName] = table
    localStorage.setItem('google_log', JSON.stringify(googleTable))
    const _p = $utils.$encodeFirebase(eventParams, 50)
    firebase.analytics().logEvent(eventName, _p, {global: true})
    // console.log(_p)
    return new Promise((resolve) => {
      resolve(1)
    })
  }
}


export default $logger