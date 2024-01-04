'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';

const db = DB.activity;

export default class extends Base {

    // 提交信息
    async subAction(){
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { 
            name ,  // 姓名
            phone , // 手机号
            res,    // 答题结果
            type,   // 1:旧 ，2:新
        } = this.post();

        if(!name||!phone||!type||!res) return this.fail(-1,'参数错误！');
        const myreg = /^1\d{10}$/;
        if(!myreg.test(phone)) return this.fail(-1,'手机号错误！');
        let model_user = this.model('jiajia_user' ,db);
        
        let num = await model_user.where(`phone='${phone}'`).select();
        if(num.length > 0) return this.success({id:num[0].id, err:'重复添加'});

        // 向记录表中插入一条记录
        let new_id = await model_user.add({
            name : name, // 发起用户姓名
            phone : phone,
            res : res,
            type : type
        });
        return this.success({id:new_id});

    }

    // 提交信息
    async getAction(){
        if(!this.allow || this.method!='get') return this.fail(-1 ,'not allow');
        let { 
            phone , // 手机号
        } = this.get();

        if(!phone) return this.fail(-1,'参数错误！');
        const myreg = /^1\d{10}$/;
        if(!myreg.test(phone)) return this.fail(-1,'手机号错误！');
        let model_user = this.model('jiajia_user' ,db);
        let num = await model_user.where(`phone='${phone}'`).select();
        if(num.length <= 0) return this.fail(-2,'找不到！');
        let user = num[0];
        user.phone = user.phone.substring(0,3)+' **** '+user.phone.substring(user.phone.length-4);
        return this.success({name:user.name, phone:user.phone ,type:user.type});
    }

    async countAction(){
        let model_user = this.model('jiajia_user' ,db);
        let old_num = await model_user.field('id').where('type=1').select();
        old_num = old_num.length;
        let new_num = await model_user.field('id').where('type=2').select();
        new_num = new_num.length;
        return this.success(`一共有${new_num+old_num}个用户参加，其中${new_num}个是新用户，${old_num}个是老用户`);
    }

}   