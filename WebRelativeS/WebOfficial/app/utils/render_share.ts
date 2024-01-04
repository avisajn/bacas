const fs = require('fs')
const path = require('path')

export default (code:string):string => {
  const bgData:Buffer = fs.readFileSync(path.resolve(__dirname, '../public/img/share_invite/share_pic_bg.png'))
  const bg:string = `data:jpg;base64,` + bgData.toString('base64')
  return `<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 1200px;
      height: 1200px;
    }
    .container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .bg {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
    }
    .bg img {
      width: 100%;
      height: 100%;
    }
    .show_code {
      position: absolute;
      width: 100%;
      top: 38%;
      z-index: 2;
    }
    .show_code div {
      margin: 0 auto;
      width: 21%;
      background-color: #FFEF2D;
      color: #734706;
      height: 64px;
      border-radius: 32px;
      text-align: center;
      line-height: 64px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: bold;
      font-size: 40px;
      letter-spacing: 2px;
    }
  </style>
  <body>
    <div class="container">
      <div class="bg">
        <img src="${bg}" alt="">
      </div>
      <div class="show_code">
        <div>${code}</div>
      </div>
    </div>
  </body>
  </html>`
}