// const barcode =  require('barcode')
// const ioBarcode = require("io-barcode")
const { DOMImplementation, XMLSerializer } = require('xmldom');
const JsBarcode = require('jsbarcode');

const fs = require('fs')
const path = require('path')
const Numeral = require('numeral')

export default async (data:any):Promise<string> => {
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null)
  const document1 = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null)
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const svgNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  JsBarcode(svgNode, data.combined_key, {
    xmlDocument: document,
    displayValue: false,
    margin:0,
    width: 5,
    height: 100
  })
  JsBarcode(svgNode1, data.express_order_num, {
    xmlDocument: document1,
    displayValue: false,
    margin:0,
    width: 5,
    height: 64
  })
  const combined_key_code:string = xmlSerializer.serializeToString(svgNode);
  const express_order_code:string = xmlSerializer.serializeToString(svgNode1);
  const logoData:Buffer = fs.readFileSync(path.resolve(__dirname, '../public/img/logistic/mokkaya_logo.jpg'))
  const logo:string = `data:jpg;base64,` + logoData.toString('base64')

  const logoData1:Buffer = fs.readFileSync(path.resolve(__dirname, '../public/img/logistic/sap_logo.png'))
  const logo1:string = `data:jpg;base64,` + logoData1.toString('base64')
  const skus:string = data.sku_details.map((val:any) => {
    const detail = Object.values(val.sku_properties || {}).join(', ')
    return `
      <div class="inner_table_line">
        <div>${val.product_title}</div>
        <div>${detail ? '-' + detail : ''}</div>
        <div>${val.amount}</div>
      </div>
    `
  }).join('')
  return `<!DOCTYPE html>
  <html lang="id">
    <head>
      <style>
      html { page-break-inside:avoid; page-break-before:always; margin: 0 auto;  }
      svg {width: 400px;}
      body {width: 604px;margin: 15px auto; }
      .container { page-break-inside:avoid; page-break-before:always; margin: 15px auto;  }
        .logisitics * {
          font-family: sans-serif;
          box-sizing: border-box;
          color: #000;
          border: none;
          background: #fff;
          fone-size: 16px;
        }
        .order_code {
          margin-top: -20px;
        }
        .order_code svg {
          width: 300px;
          margin-bottom: -20px;
        }
        .sap_logo {
          margin-right: 10px;
        }
        .city_code {
          /* height: 32px; */
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          padding-top: 5px !important;
          line-height: 40px !important;
        }
        *{
          font-family: sans-serif;
          font-size: 16px;
        }
        .logisitics p {
          margin: 0;
        }
        .container {
          padding:  0;
        }
       .table {
          border: 1px solid #333;
          width: 602px;
          max-width: 100%;
          margin: 0 auto;
        }
       .table .table_line {
          border-bottom: 1px solid #333;
          display: flex;
        }
       .table .table_line > div:first-child {
          width: calc(130 / 600 * 100%);
          padding: 4px 0;
          text-align: center;
          border-right: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
        }
       .table .table_line > div:first-child img {
          width: 115.5px;
          max-width: 100%;
        }
       .table .table_line > div:first-child span {
          font-size: 14px;
          font-weight: bold;
        }
       .table .table_line > div:nth-child(2) {
          width: calc((600 - 130) / 600 * 100%);
          height: 100%;
        }
       .table .table_line > div:nth-child(2) div {
          padding: 5px;
        }
       .table .table_line > div:nth-child(2) div p {
          line-height: 24px;
          font-size: 14px;
        }
       .table .table_line > div:nth-child(2) .img_wrap {
          width: 100%;
          text-align: center;
          padding: 0;
        }
       .table .table_line > div:nth-child(2) .img_wrap svg {
          max-height: 100%;
          max-width: 100%;
        }
       .table .table_line > div:nth-child(2) div.inner_table {
          padding: 0;
        }
        .table .table_note {
          padding: 10px 30px;
          text-align: center;
          line-height: 1.2;
          color: #000;
          font-size: 15px;
          border-bottom: 1px solid #333;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_title div {
          padding: 0;
          text-align: center;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line {
          padding: 0;
          display: flex;
          font-size: 14px;
          border-top: 1px solid #333;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line div {
          padding: 0 5px;
          min-height: 26px;
          line-height: 1.4;
          word-break: break-word;
          font-size: 14px;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line div:first-child {
          width: calc(290 / 600 * 100%);
          padding-left: 10px;
          word-wrap: break-word;
          border-right: 1px solid #333;
          display: flex;
          line-height: 24px;
          align-items: center;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line div:nth-child(2) {
          width: calc(110 / 600 * 100%);
          padding: 5px;
          display: flex;
          align-items: center;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line div:last-child {
          width: calc(40 / 600 * 100%);
          text-align: center;
          border-left: 1px solid #333;
          display: flex;
          justify-content: center;
          align-items: center;
        }
       .table .table_line > div:nth-child(2) div.inner_table .inner_table_line:first-child div:first-child {
          font-weight: bold;
        }
       .table .table_line > div.two:nth-child(2) {
          display: flex;
        }
       .table .table_line > div.two:nth-child(2) div:first-child {
          width: calc(350 / 600 * 100%);
          border-right: 1px solid #333;
        }
       .table .table_line > div.two:nth-child(2) div:last-child {
          width: calc(60 / 600 * 100%);
          display: flex;
          justify-content: center;
          align-items: center;
        }
       .table .table_line > div.two:nth-child(2) div:last-child span {
          font-size: 16px;
          font-weight: bolder;
        }
       .table .table_line:last-child {
          border: none;
        }
       .table .table_line:last-child > div:first-child {
          /* width: 100px; */
          width: calc(130 / 600 * 100%);
        }
       .table .table_line:last-child > div:last-child {
          width: calc((600 - 130) / 600 * 100%);
        }
       .table_sicepat {
          width: 602px;
          border: 1px solid #333;
        }
       .table_sicepat .logo_line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .logo_line div:first-child img {
          width: 56px;
          height: 56px;
          max-width: 100%;
          padding: 0 3px;
        }
       .table_sicepat .logo_line div:last-child img {
          width: 85px;
          max-width: 100%;
        }
       .table_sicepat .code_line {
          text-align: center;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .code_line div {
          font-size: 14px;
          margin-top: -8px;
          padding-bottom: 5px;
          font-weight: bold;
        }
       .table_sicepat .price_line {
          font-size: 26px;
          font-weight: bold;
          text-align: center;
          line-height: 50px;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .reg_line {
          line-height: 30px;
          text-align: center;
          font-size: 16px;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .order_line {
          display: flex;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .order_line > div:first-child {
          width: 68%;
          text-align: center;
          border-right: 1px solid #333;
        }
       .table_sicepat .order_line > div:first-child img {
          width: 96%;
          height: 64px;
        }
       .table_sicepat .order_line > div:first-child div {
          font-size: 14px;
          margin-top: -8px;
          padding-bottom: 5px;
          font-weight: bold;
        }
       .table_sicepat .order_line .insure_info {
          width: 32%;
          padding: 10px 0 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
       .table_sicepat .order_line .insure_info div {
          width: 100%;
          text-align: center;
        }
       .table_sicepat .order_line .insure_info div:first-child {
          font-size: 16px;
          line-height: 20px;
        }
       .table_sicepat .order_line .insure_info div:last-child {
          font-size: 18px;
          line-height: 24px;
        }
       .table_sicepat .address_line {
          display: flex;
          border-bottom: 1px solid #333;
        }
       .table_sicepat .address_line > div {
          padding: 0 5px 10px;
          width: 50%;
          font-size: 14px;
        }
       .table_sicepat .address_line > div > div:first-child {
          line-height: 24px;
          font-weight: bold;
        }
       .table_sicepat .address_line > div > div:nth-child(2) {
          margin-bottom: 15px;
        }
       .table_sicepat .address_line > div div {
          line-height: 20px;
        }
       .table_sicepat .address_line > div:first-child {
          border-right: 1px solid #333;
        }
        .logisitics .btn {
          padding: 80px 50px;
        }
        .logisitics .btn button {
          margin-top: 10px;
          width: 120px;
          height: 32px;
          background: #38adff;
          color: #fff;
          border: none;
          border-radius: 5px;
          outline: none;
        }
        .logisitics #canvas {
          display: none;
        }
        </style>
    </head>
    <body>
    <div class="container" >
    <div class="table_sicepat table" ref="ticket_2">
      <div class="logo_line">
        <div>
          <img src="${logo}" alt="">
        </div>
        <div class="sap_logo">
          <img src="${logo1}" alt="">
        </div>
      </div>
      <div class="code_line">
        ${express_order_code}
        <div>${data.express_order_num}</div>
      </div>
      <div class="price_line">${
        data.user_payment_type === 3 ?
        `COD: Rp. ${Numeral(data.cod_price).format('0,0').replace(/,/g, '.')},-`
        :
        'NON COD'
      }</div>
      <div class="reg_line">
        Jenis Layanan: ${data.delivery_type}
      </div>
      <div class="order_line">
        <div class="order_code" style="border-right: none;">
          ${combined_key_code}
          <div>${data.combined_key}</div>
        </div>
        <div class="insure_info"  style="border-left: 1px solid #333;">
          <div>Asuransi:</div>
          ${
            data.insurance_price ?
            `<div>Rp. ${Numeral(data.insurance_price).format('0,0').replace(/,/g, '.')},-</div>`
            :
            '<div>Rp. 0,-</div>'
          }
        </div>
      </div>
      <div class="address_line">
        <div class="resaller">
          <div>Penerima:</div>
          <div>
            <span>Nama:</span>
            <span>${data.receiver_name}</span>
          </div>
          <div>
            Alamat Lengkap:${data.recipient_address}, ${data.recipient_city}, ${data.recipient_sub_district}, ${data.recipient_province}, ${data.recipient_code}${data.recipient_landmark ? '(' + data.recipient_landmark + ')' : ''}
          </div>
          <div>
            <span>Nomor Telepon:</span>
            <span>${data.telepon}</span>
          </div>
        </div>
        <div class="sender">
          <div>Pengirim:</div>
          <div>
            ${data.source === 3 ? '<span>Ini adalah hadiah gratis dari [MOKKAYA], sebagai penghargaan atas pencapaian Anda bersama kami!</span>' : ('<span>Nama:</span><span>' + data.sender_name + '</span>')}
          </div>
          ${
            data.source === 3 ? '' 
            : 
            `<div>
              <span>Nomor Telepon:</span>
              <span>${data.reseller_phone_number}</span>
            </div>`
          }

        </div>
      </div>
      <div class="address_line">
        <div class="reseller city_code">${data.end_city_code || 'CBN'}</div>
        <div class="sender city_code">${data.start_city_code || 'CBN'}</div>
      </div>
      <div class="table_note">
        <div>
          PERHATIAN: Ambil video unboxing ketika membuka paket pertama kali, untuk mempermudah proses komplain ke penjual.
        </div>
      </div>
      <div class="table_line">
        <div>
          <span>Info Barang:</span>
        </div>
        <div>
          <div class="inner_table">
            <div class="inner_table_title">
              <div>Total: ${data.total_amount}</div>
            </div>
            <!-- skus -->
            ${skus}
          </div>
        </div>
      </div>
    </div>
  </div>
    </body>
  </html>`
}
