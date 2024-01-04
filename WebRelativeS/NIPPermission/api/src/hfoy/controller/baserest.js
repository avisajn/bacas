'use strict';

import {decryptCode} from '../../util.js';
export default class extends think.controller.rest {
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
    if(this.http.method.toLowerCase() === "options"){
      this.end();
      return this.fail(-1);
    }

    let token = this.cookie("token");
    if(!token || token == '0'){
      return this.fail(-99);
    }
    const decryptedData = decryptCode(token);
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

    this.getUserId = function(){
        return _userInfo.id;
    }

  }

  __call(){
    return this.fail(think.locale("ACTION_INVALID", this.http.action, this.http.url));
  }
}