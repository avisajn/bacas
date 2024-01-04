'use strict';

import {decryptCode} from '../../util.js';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    let allowAccessOrigin = this.http.headers.origin;
    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With, enctype');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    this.header('Access-Control-Allow-Credentials', 'true');
    if(this.http.method == "OPTIONS"){
      this.end();
      return;
    }
    
    // let ciphertext = this.cookie("token");
    // if(!ciphertext || ciphertext == '0'){
    //   return this.fail(-99);
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