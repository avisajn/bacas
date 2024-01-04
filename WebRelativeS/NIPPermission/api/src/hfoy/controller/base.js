'use strict';

import {decryptCode} from '../../util.js';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allow = ['hatech' ,'localhost' ,'hadoopfinetech'];

    let allowAccessOrigin = this.http.headers.origin;
    let isAllow = false;
    if(think.env == 'development') isAllow = true;

    for(let i=0,len=allow.length;i<len;i++){
        if(isAllow) break;
        if(allowAccessOrigin && allowAccessOrigin.indexOf(allow[i]) >= 0) isAllow = true;
    }

    if(isAllow){
        this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    }else{
        this.header('Access-Control-Allow-Origin', 'ywordle.ymark.cc');
    }

    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    this.header('Access-Control-Allow-Credentials', 'true');
    if(this.http.method == "OPTIONS"){
      this.end();
      return;
    }
    if(this.http.url != '/hfoy/login/'){
      let ciphertext = this.cookie("token");
      if(!ciphertext || ciphertext == '0'){
        return this.fail(-99);
      }

      const decryptedData = decryptCode(ciphertext);
      if(!decryptedData || !decryptedData.id || !decryptedData.username){
        return this.fail(-99);
      }
      if(new Date().getTime() >= decryptedData.time){
        return this.fail(-98);
      }
      let _userInfo = decryptedData;
      this.getUser = function(){
        return _userInfo;
      }

      this.getRids = function(){
        return _userInfo.roleids;
      }

      this.getUserId = function(){
          return _userInfo.id;
      }
    }
  }
}