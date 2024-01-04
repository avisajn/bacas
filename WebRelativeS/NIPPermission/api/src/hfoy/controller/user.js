'use strict';

let DateFormat = require('dateformat');
import Base from './basenone.js';
import DB from '../../db.js';
import MD5 from 'blueimp-md5';
const db = DB.dbhadoop;

import {decryptCode ,encryptCode} from '../../util.js';
import API from '../../api.js';

export default class extends Base {
    // 添加一条数据
    async regAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        let param = this.post();
        let username = param.username,
            // password = param.password,
            demand = param.demand,
            pwd = param.t,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        const email = param.email || '-';
        if(!username || !email ) return this.fail(-1 ,'参数不正确');
        
        if(pwd) pwd = MD5(pwd);
        else pwd = '-';

        // console.log(pwd);
        // return this.success('添加成功！');
        // 这里获取新的userid
        const userInfo = await API.getUserId();
        if(userInfo.status != 'ok') return this.fail(-1 ,'获取用户ID出错了！');;
        
        let model = this.model('user' ,db);
        const user_id = await model.add({
            id : userInfo.account_id,
            username : username||'-',
            password : pwd||'-',
            addtime : time,
            email : email||'-',
            demand : demand||'-',
            status : 0,
            apikey : userInfo.api_key
        })
        return this.success({user_id : user_id, msg : '提交成功！'});
    }


    async getAction(){
        let model = this.model('user' ,db);
        const data = await model.order('id desc').field('apikey,demand,username,email').select();
        return this.success(data);
    }

    async gettokenAction(){
        // 输入一个 id 和 email ，然后生成一个 email地址
        let param = this.get();
        let id = param.id;

        if(!id) return this.fail(-1 ,'参数不正确');

        let ciphertext = encryptCode({
            time : (new Date().getTime() + 1 * 60 * 60 * 1000),
            id : id
        });

        return this.success(`?t=${ciphertext}`);
    }





    // 添加一条数据
    async postAction(){
        let param = this.post();
        let username = param.username,
            // password = param.password,
            email = param.email,
            demand = param.demand,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        if(!username || !email || !demand){
            return this.fail(-1 ,'参数不正确');
        }

        let model = this.model('user' ,db);
        await model.add({
            username : username,
            // password : password,
            addtime : time,
            email : email,
            demand : demand,
            status : 0,
        })
        return this.success('添加成功！');
    }

    // 修改一条数据
    async putAction(){
        if(!this.id){
            return this.fail('id为空！');
        }

        let param = this.post();
        let id = param.id, 
            username = param.username,
            email = param.email,
            demand = param.demand;
        if(!username || !email || !demand){
            return this.fail(-1 ,'参数不正确');
        }
        let model = this.model('user' ,db);

        let insertId = await model.where({id: id }).update({
            username : username,
            email : email,
            demand : demand,
        });
        return this.success('修改成功');
    }

    async setpwdAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        // 验证旧的密码是否正确
        let param = this.post();
        if(!param.data){
            return this.fail(-1 ,'参数错误');
        }
        const decryptedData = decryptCode(param.data);
        let _old = decryptedData.old ,
            _new = decryptedData.new ,
            _id = decryptedData.id ;
        if(!_id || !_old || !_new){
            return this.fail(-1 ,'参数错误');
        }
        let model = this.model('user' ,db);
        await model.where({id:_id}).update({password : _new ,status:1});
        return this.success('重置成功！');
    }
}