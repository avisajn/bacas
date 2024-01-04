'use strict';

import {decryptCode} from '../../util.js';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {
    const allow = ['ymark.cc' ,'localhost' ,'liaoshane.com']

    let { origin='', uk='' } = this.http.headers;

    this.ip = this.http.ip();

    let isAllow = false;
    if(think.env == 'development' || uk == 'wx_xiaochengxu') isAllow = true;

    for(let i=0,len=allow.length;i<len;i++){
        if(isAllow) break;
        if(origin && origin.indexOf(allow[i]) >= 0) isAllow = true;
    }

    if(isAllow){
        this.header('Access-Control-Allow-Origin', origin);
    }else{
        this.header('Access-Control-Allow-Origin', 'ywordle.ymark.cc');
    }
    // this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With ,enctype ,location');
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,enctype ,location ,document,uk');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    this.header('Access-Control-Allow-Credentials', 'true');
    this.allow = isAllow;
    if(this.http.method == "OPTIONS"){
      this.end();
      return;
    }

    // 1:备孕，2:孕中，3:产后
    
    // let ciphertext = this.cookie("token");

    // if(ciphertext && ciphertext != '0'){
    //   // return this.fail(-99);
    //     const decryptedData = decryptCode(ciphertext);
    //     // 必须传入过期时间 和 modulename  
    //     // 事例 
    //     // {
    //     //    time -> 过期时间  [后期会被用到]
    //     //    platform -> 平台 [app.ios | app.android]
    //     // }
    //     if(decryptedData){
    //         if(new Date().getTime() >= decryptedData.time){
    //             return this.fail(-98);
    //         }
    //         let _userInfo = decryptedData;
    //         this.userinfo = function(){
    //           return _userInfo;
    //         }
    //         this.userid = _userInfo.u;
    //     }
    // }


    // const platform = {
    //   'app.ios'       : true,
    //   'app.android'   : true,
    //   'web'           : true,
    // }

    // const decryptedData = decryptCode(ciphertext);
    // // 必须传入过期时间 和 modulename  
    // // 事例 
    // // {
    // //    time -> 过期时间  [后期会被用到]
    // //    platform -> 平台 [app.ios | app.android]
    // // }
    // if(!decryptedData || !decryptedData.platform || !platform[decryptedData.platform]){
    //   return this.fail(-99);
    // }

    // if(new Date().getTime() >= decryptedData.time){
    //   return this.fail(-98);
    // }
    // let _userInfo = decryptedData;
    // this.getUser = function(){
    //   return _userInfo;
    // }

    // this.getRids = function(){
    //   return _userInfo.roleids;
    // }

    // this.getUserId = function(){
    //     return _userInfo.id;
    // }
  }
}