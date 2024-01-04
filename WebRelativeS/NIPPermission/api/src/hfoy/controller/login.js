'use strict';

import Base from './base.js';
import DB from '../../db.js';
const db = DB.dbhadoop;

import {decryptCode ,encryptCode} from '../../util.js';

export default class extends Base {
    // 登录验证
    async indexAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        let token = this.post().data;
        if(!token){return this.fail(-1,'参数错误！'); }
        const userData = decryptCode(token);
        if(!userData){return this.fail(-2 ,'错误的数据！'); }

        let username = userData.username,
            password = userData.password;

        if(!username || !password){return this.fail(-1,'参数错误'); }

        let model = this.model('user' ,db);


        console.log('model:',model);

        let users = await model.field('id,username').where({username:username,password:password}).select();

        if(users.length <= 0){return this.fail(-2,'用户名或密码错误！'); }
        users = users[0];
        users.time = (new Date().getTime() + 10 * 24 * 60 * 60 * 1000);

        let ciphertext = encryptCode(users);
        this.cookie("token", ciphertext, {
          timeout: 10 * 24 * 3600 //设置 cookie 有效期为 7 天
        });
        return this.success({id : users.id ,token : ciphertext });
    }


    // 添加一条数据
    async postAction(){
        let param = this.post();
        let username = param.username,
            email = param.email,
            demand = param.demand,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        if(!username || !email || !demand){
            return this.fail(-1 ,'参数不正确');
        }

        let model = this.model('user' ,db);
        const id = await model.add({
            username : username,
            addtime : time,
            email : email,
            demand : demand,
            status : 0,
        })
        // let ciphertext = encryptCode({
        //     id : id,
        //     setPassword : true,
        // });
        // this.cookie("token", ciphertext, {
        //   timeout: 1 * 60 * 60 //设置 cookie 有效期为 7 天
        // });
        // return this.success({token : ciphertext });
        return this.success('注册成功！');
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
        let model = this.model('user' ,db);
        let users = await model.field('id').where({username:_name, password:_old}).select();
        if(users.length <= 0){
            return this.fail(-2 ,'旧密码错误');
        }
        let userId = users[0].id;
        await model.where({id:userId}).update({password : _new });
        return this.success('重置成功！');
    }

}