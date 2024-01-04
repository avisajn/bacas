'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';

const db = DB.activity;

const answerMapping = {
    '_1' : 'A',
    '_2' : 'B',
    '_3' : 'C',
    '_4' : 'D',
    '_5' : 'E',
}

export default class extends Base {

    // 返回所有的发布人
    async saveAction(){
        return this.fail(-1 ,'not allow'); 
        let param = this.post();
        let name    = param.name,
            city   = param.city,
            phone   = param.phone,
            q_1     = param.q_1,
            q_2     = param.q_2,
            q_3     = param.q_3,
            q_4     = param.q_4,
            q_5     = param.q_5,
            q_6     = param.q_6,
            q_7     = param.q_7,
            q_8     = param.q_8,
            q_9     = param.q_9,
            q_10    = param.q_10,
            q_11    = param.q_11;

        if(!name || !phone){return this.fail(-1 ,'参数不正确'); }

        let model = this.model('mother_question' ,db);
        const id = await model.add({name ,city, phone, q_1, q_2, q_3, q_4, q_5, q_6, q_7, q_8, q_9, q_10, q_11 });
        if(id){
            return this.success(id);
        }else{
            return this.fail(-1 ,id);
        }
    }


    async getAction(){
        return this.fail(-1 ,'not allow'); 
        let model = this.model('mother_question' ,db);
        let res = await model.field('name,phone,city,q_1,q_2,q_3,q_4,q_5,q_6,q_7,q_8,q_9').order('id desc').select();
        res.map((k) => {
            k.q_1 = answerMapping['_'+k.q_1];
            k.q_2 = answerMapping['_'+k.q_2];
            k.q_3 = answerMapping['_'+k.q_3];
            k.q_4 = answerMapping['_'+k.q_4];
            k.q_5 = answerMapping['_'+k.q_5];
            k.q_6 = answerMapping['_'+k.q_6];
            k.q_7 = answerMapping['_'+k.q_7];
            k.q_8 = answerMapping['_'+k.q_8];
            k.q_9 = answerMapping['_'+k.q_9];
        });
        return this.success(res);
    }
}   