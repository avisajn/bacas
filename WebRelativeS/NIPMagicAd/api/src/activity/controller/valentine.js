'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';

const db = DB.activity;

export default class extends Base {

    // 返回所有的发布人
    async createAction(){
        return this.fail(-1 ,'not allow'); 
        let param = this.post();
        let userid    = param.userid;

        if(!userid ){return this.fail(-1 ,'参数不正确'); }

        let model = this.model('valentine' ,db);
        const id = await model.add({userid ,w1:0,w2:0,w3:0,w4:0 });
        if(id){
            return this.success(id);
        }else{
            return this.fail(-1 ,id);
        }
    }

    async setAction(){
        return this.fail(-1 ,'not allow'); 
        let param   = this.post();
        let userid  = param.userid,
            type    = param.type,
            status    = param.status;

        if(!userid || !type){return this.fail(-1 ,'参数不正确'); }

        let model = this.model('valentine' ,db);
        const obj = {};
        obj['w'+type] = status;
        if(status == 0){
            obj['w'+type+'_time'] = '';
        }else{
            obj['w'+type+'_time'] = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        const id = await model.where({userid}).update(obj);
        if(id){
            return this.success(id);
        }else{
            return this.fail(-1 ,id);
        }
    }

    async getAction(){
        return this.fail(-1 ,'not allow'); 
        let params      = this.get() || {},
            userid     = params.userid || 1;

        let model = this.model('valentine' ,db);
        let res = await model.field('w1,w2,w3,w4').where("userid='"+userid+"'").select();
        if(res.length > 0){
            return this.success(res[0]);
        }
        return this.fail(-1);
    }


    async getlistAction(){
        return this.fail(-1 ,'not allow'); 
        let model = this.model('valentine' ,db);
        let res = await model.field('userid,w1,w1_time,w2,w2_time,w3,w3_time,w4,w4_time').order('id desc').select();
        return this.success(res);
    }
}   