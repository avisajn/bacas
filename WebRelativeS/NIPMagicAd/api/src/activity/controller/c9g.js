'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';

const db = DB.activity;


const getRandom = function(min ,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

const getFixed = function (v){
    let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
}


export default class extends Base {

    // 根据uk获取用户信息
    async getinfoAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { ud } = this.get();
        if(!ud) return this.fail(-1, '参数错误！');
        let model_all_user = this.model('all_user' ,db);
        let users = await model_all_user.field('id,name,phone,address').where("k='"+ud+"'").select();
        if(users.length <= 0) return this.success(null);
        users = users[0];
        return this.success(users);
    }

    // 提交信息
    async subAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { 
            uk:user_key ,
            uid : user_id , // 用户ID
            name ,    
            phone ,   
            res ,
            address ,   
            sp:support_girl , // 提交者的头像
        } = this.post();


        if(!name||!phone||!address||!support_girl||!res) return this.fail(-1,'参数错误！');

        let model_girl = this.model('campagin9girl' ,db);
        let num = await model_girl.where(` name='${name}' and phone='${phone}' `).select();
        if(num.length > 0) return this.success({id:num[0].id, err:'重复添加'});
        let model_all_user = this.model('all_user' ,db);
        if(user_id || user_key){
            if(!user_id){
                user_id = await model_all_user.add({
                    k : user_key, // 题库ID
                    name : name, // 发起用户姓名
                    phone : phone, // 发起用户ID
                    address : address,
                    avatar : '-'
                });
            }else{
                await model_all_user.where(`id=${user_id} and k='${user_key}'`).update({
                    name : name ,
                    phone : phone ,
                    address : address
                });
            }
        }

        // 向记录表中插入一条记录
        let uid = await model_girl.add({
            k : user_key, // 题库ID
            uid : user_id, // 发起用户ID
            name : name, // 发起用户姓名
            phone : phone,
            res_json : res,
            select_img : support_girl,
        });


        return this.success({id:uid});

    }

    // 根据用户id，uk查询用户选择的支持女生
    async getAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        let model = this.model('campagin9girl' ,db);
        let statistic = await model.field('select_img s,count(1) n').group('select_img').select();
        const { ud ,uid } = this.get();
        if(!ud && !uid) return this.success({u:null ,s:statistic});
        let users = await model.field('id,name,select_img').where("k='"+ud+"' or id='"+uid+"'").select();
        if(users.length <= 0) return this.success({u:null ,s:statistic});
        users = users[0];
        return this.success({u:users ,s:statistic});
    }



}   