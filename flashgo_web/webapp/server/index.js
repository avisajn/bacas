
// import axios from 'axios'
// // import { Message } from 'element-ui'
// import qs from 'qs'
// import config from './config'

const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method.toLowerCase() == 'options') {
    res.send(200); /让options请求快速返回/
  }
  else {
    next();
  }
});
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()


// if (process.server) {
//   config.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
// }

// const service = axios.create(config)

// // POST 传参序列化
// service.interceptors.request.use(
//   config => {
//     if (config.method === 'post') config.data = qs.stringify(config.data)
//     return config
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )
// // 返回状态判断
// service.interceptors.response.use(
//   res => {
//     return res.data
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )

// export default {
//   post (url, data) {
//     console.log('post request url', url)
//     return service({
//       method: 'post',
//       url,
//       params: data
//     })
//   },
//   get (url, data) {
//     console.log('get request url', url)
//     return service({
//       method: 'get',
//       url,
//       params: data
//     })
//   },
//   delete (url, data) {
//     console.log('delete request url', url)
//     return service({
//       methods: 'delete',
//       url,
//       params: data
//     })
//   }
// }

