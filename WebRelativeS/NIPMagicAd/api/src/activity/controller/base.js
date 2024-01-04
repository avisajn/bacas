'use strict';

import {decryptCode} from '../../util.js';
var Base64 = require('js-base64').Base64;

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allow = ['event.baca.co.id' ,'localhost' ,'event.cennoticias.com' ,'event.festival.8jiajia.ymark.cc']

    let allowAccessOrigin = this.http.headers.origin;
    let isAllow = false;
    if(think.env == 'development') isAllow = true;
    // console.log('all-1;',isAllow);

    for(let i=0,len=allow.length;i<len;i++){
        if(isAllow) break;
        if(allowAccessOrigin && allowAccessOrigin.indexOf(allow[i]) >= 0) isAllow = true;
    }
    // console.log('all-2;',isAllow);
    // console.log('all-2-1;',allowAccessOrigin);

    if(isAllow){
        this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    }else{
        this.header('Access-Control-Allow-Origin', 'event.baca.co.id');
    }
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept ,X-Requested-With,uk,enctype,document,location');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    this.header('Access-Control-Allow-Credentials', 'true');
    const method = this.http.method.toLocaleLowerCase();
    this.method = method;
    if(method == "options"){
      this.allow = false;
      this.end();
      return;
    }
    // console.log('all-3;',isAllow ,method);    
    // 判断

    // let ciphertext = this.cookie("token");
    // let ciphertext = this.http.headers['uk'];
    // ciphertext = Base64.decode(ciphertext || '');
    
    // if(isAllow && ciphertext && ciphertext != '0'){
    //   this.uk = ciphertext;
    //   // return this.fail(-99);
    //     const decryptedData = decryptCode(ciphertext);
    //     // 必须传入过期时间 和 modulename  
    //     // 事例 
    //     // {
    //     //    time -> 过期时间  [后期会被用到]
    //     // }
    //     if(decryptedData){
    //         if(!decryptedData.key){
    //           this.allow = false;
    //         }else{
    //           this.allow = true;
    //         }
    //     }
    // }else{
    //   this.allow = false;
    // }

    this.allow = isAllow;

  }
}