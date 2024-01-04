'use strict';

import {decryptCode} from '../../util.js';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allow = ['hatech' ,'localhost' ,'hadoopfinetech'];

    let allowAccessOrigin = this.http.headers.origin;
    console.log('allowAccessOrigin:',allowAccessOrigin);
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
  }
}