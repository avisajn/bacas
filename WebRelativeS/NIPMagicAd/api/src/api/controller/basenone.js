'use strict';

import {decryptCode} from '../../util.js';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    let allowAccessOrigin = this.http.headers.origin;
    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    // this.header('Access-Control-Allow-Credentials', 'true');
  }
}