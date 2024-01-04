'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import {decryptCode ,simpleDecryptCode} from '../../util.js';

const db = DB.activity;
import LRU from 'lru-cache';
const cache = LRU({maxAge: 1000 * 60 * 30 });


// http://img.cdn.baca.co.id/event/top10/avatar/1.png
const getRandom = function(min ,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

const getFixed = function (v){
    let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
}

const verifyToken = function (token) {
    try{
        const res = decryptCode(token ,'ymark-campaign');
        if(!res || !res.userid || !res.utc || res.userid == 'wap_') return false;
        const date_time = new Date(res.utc);
        // if(typeof(date_time) != 'object') return false;
        // const current_utc_str = (new Date()).toUTCString();
        // const current_utc_time = (new Date( current_utc_str  )).getTime();
        // 差值必须小于20分钟以内
        // if(parseInt(Math.abs(date_time.getTime() - current_utc_time)/(1000*60)) >= 20){
            // return false;
        // }
        return res.userid;
    }catch(e){
        return false;
    }
}

export default class extends Base {

    async userAction(){
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        const {t} = this.post();
        if(!t) return this.fail(-1, '参数错误！');
        const user_id = verifyToken(t);
        if(!user_id) return this.fail(-1.2, '参数错误！');
        const localData = cache.get('user_id_object');
        if(localData && localData[user_id]) return this.success(localData[user_id]);
        // 数据库
        return this.fail(-2, 'null');
    }


    async alluserAction(){
        let model = this.model('gc_user_temp' ,db);
        const list = await model.field('name,sex,phone,city').select();
        return this.json(list);
    }


    async adduserAction(){
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { name, phone ,city ,userid ,sex } = this.post();
        if( !name || !phone || !city || !sex || !userid ) return this.fail(-1.21, '参数错误！');
        let model = this.model('gc_user_temp' ,db);
        let new_id = await model.add({
            name : name ,
            phone : phone ,
            city : city ,
            sex : sex ,
            user_id : userid,
        });
        if(new_id > 0) {
            let localData = cache.get('user_id_object') || {};
            localData[userid] = {name:name ,phone:phone ,city:city};
            cache.set('user_id_object' ,localData);
            return this.success('添加成功！');
        }else{
            return this.fail(-2,'添加失败！');
        }
    }


}