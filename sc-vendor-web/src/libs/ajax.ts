import axios from 'axios'
import firebaseConfig from '../config/firebase'
import { baseURL } from '../config'

const changeToken = async ():Promise<string> =>  {
  if (!localStorage.getItem('rtf')) {
    return ''
  } else {
    const refreshToken:any = await axios({
      method: "POST",
      timeout: 30000,
      url: `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`,
      data: {
        grant_type: "refresh_token",
        refresh_token: localStorage.getItem('rtf')
      }
    })
    if (refreshToken.data && refreshToken.data.id_token) {
      // console.log( Number(refreshToken.data.expires_in))
      localStorage.setItem('valid_time', ((new Date().getTime() + Number(refreshToken.data.expires_in * 1000)).toString()))
      return refreshToken.data.id_token
    } else {
      return ''
    }
  }
}

const $instance = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? '' : baseURL,
  timeout: 60 * 1000
})

// 拦截请求
$instance.interceptors.request.use(async (config:any) => {
  const validTime:number = localStorage.getItem('valid_time') ? Number(localStorage.getItem('valid_time')) : 0
  // console.log(validTime, new Date().getTime())
  // console.log(validTime > new Date().getTime())
  if (!validTime) {
    window.location.href = window.location.origin + '/login'
  } else if (validTime > new Date().getTime() + 10 * 60 * 1000) {
    config.headers.Authorization = localStorage.getItem('access_token')
  } else {
    // 请求间隔时间过长
    const newToken:string = await changeToken()
    if (newToken) {
      localStorage.setItem('access_token', newToken)
      config.headers.Authorization = newToken
    } else {
      window.location.href = window.location.origin + '/login'
      // config.headers.Authorization = await changeToken()
    }
  }
  return config
}, err => {
  // console.log(err)
  return Promise.reject(err)
})

// 拦截返回
$instance.interceptors.response.use((res:any) => {
  if (res.data.code === 2000000) {
    // window.location.href = window.location.origin + '/login'
  } else {
    localStorage.setItem('lastApiTime', new Date().getTime().toString())
    return res
  }
}, (err: any) => {
  // console.log(err)
  return err
})

export default $instance
