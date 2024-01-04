'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './base.js';

import {decryptCode ,encryptCode} from '../../util.js';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    // 登录验证
    async indexAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        console.log('开始请求！。。');
        let token = this.post().data;
        if(!token){return this.fail(-1,'参数错误！'); }
        console.log('t1');
        const userData = decryptCode(token);
        console.log('t2' ,userData);
        if(!userData){return this.fail(-2 ,'错误的数据！'); }

        let username = userData.username,
            password = userData.password;
        console.log('t3' ,username ,password);
        if(!username || !password){return this.fail(-1,'参数错误'); }
        
        let model = this.model('user', db);
        console.log('t4');
        let users = await model.field('id,username,country,roleids').where({username:username,password:password}).select();
        console.log('t5');
        if(users.length <= 0){return this.fail(-2,'用户名或密码错误！'); }
        console.log('t6');
        users = users[0];
        console.log('t7' ,users);
        users.time = (new Date().getTime() + 10 * 24 * 60 * 60 * 1000);

        let ciphertext = encryptCode(users);
        console.log('t8' ,ciphertext);
        this.cookie("token", ciphertext, {
          timeout: 10 * 24 * 3600 //设置 cookie 有效期为 7 天
        });
        return this.success({id : users.id ,country:users.country, rids : users.roleids ,token : ciphertext });
    }


    async outAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        this.cookie("token" ,null);
        return this.success("");
    }

    async resetpwdAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        // 验证旧的密码是否正确
        let param = this.post();
        if(!param.data){
            return this.fail(-1 ,'参数错误');
        }
        const decryptedData = decryptCode(param.data);
        let _old = decryptedData.old ,
            _new = decryptedData.new ,
            _name = decryptedData.username ;
        if(!_name || !_old || !_new){
            return this.fail(-1 ,'参数错误');
        }
        let model = this.model('user', db);
        let users = await model.field('id').where({username:_name, password:_old}).select();
        if(users.length <= 0){
            return this.fail(-2 ,'旧密码错误');
        }
        let userId = users[0].id;
        await model.where({id:userId}).update({password : _new });
        return this.success('重置成功！');
    }
}