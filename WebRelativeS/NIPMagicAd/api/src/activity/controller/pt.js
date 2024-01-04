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


    // 获得排名
    async rankingAction(){
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { page=1 } = this.get();
        const localData = cache.get('pt-ranking'+page);
        if(localData && localData.length > 0) return this.success(localData);
        let model = this.model('pt_user' ,db);
        let lists = await model.field('name ,time').limit(0,20).order('time').select();
        cache.set('pt-ranking'+page ,lists);
        return this.success(lists);
    }

    async addAction(){
        console.log('add--->interface');
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        const { t:ent } = this.post();
        if(!ent) return this.fail(-1.1 ,'参数错误！');
        
        const res = simpleDecryptCode(ent ,'only-test');
        if(!res)  return this.fail(-1.2 ,'参数错误！');
        let { time ,name, phone ,city,t } = res;
        if(!time || !name || !phone || !city || !t) return this.fail(-1.21, '参数错误！');
        const user_id = verifyToken(t);
        console.log('验证结束！',t,'  ++userid++:',user_id);
        if(!user_id) return this.fail(-1.3 ,'参数错误！');
        let model = this.model('pt_user' ,db);
        // 查询一下
        const old_list = await model.field('id,time').where(" phone='"+phone+"' and name='"+name+"' ").select();
        console.log('old_list:',old_list);
        if(old_list && old_list.length > 0){    // 判断是否为最好成绩
            if(time < old_list[0].time ){   // 则意味着 需要更新数据库
                cache.del('pt-ranking');
                await model.where(`id=${old_list[0].id}`).update({time : time });
                console.log('刷新成绩！');
                return this.success('已经刷新成绩！'); 
            }
            return this.success('无需添加，不是最好的成绩');
        }else{
            console.log('开始添加！');
            let new_id = await model.add({
                time : time, // 发起用户姓名
                name : name ,
                phone : phone ,
                city : city ,
                user_id : user_id,
            });
            console.log('添加结果！' ,new_id);
            if(new_id > 0) {
                let localData = cache.get('user_id_object') || {};
                localData[user_id] = {name:name ,phone:phone ,city:city};
                cache.set('user_id_object' ,localData);
                cache.del('pt-ranking');
                console.log('添加成功！');
                return this.success('添加成功！');
            }else{
                return this.fail(-2,'添加失败！');
            }
            
        }
    }

    async alluserAction(){
        let model = this.model('pt_user_temp' ,db);
        const list = await model.field('name,phone,city').select();
        return this.json(list);
    }

    async passuserAction(){
        let model = this.model('pt_user' ,db);
        const list = await model.field('name,phone,city,time').select();
        return this.json(list);
    }



    async adduserAction(){
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { name, phone ,city ,userid } = this.post();
        if( !name || !phone || !city || !userid ) return this.fail(-1.21, '参数错误！');
        let model = this.model('pt_user_temp' ,db);
        let new_id = await model.add({
            name : name ,
            phone : phone ,
            city : city ,
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