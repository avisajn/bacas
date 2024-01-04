'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';

const db = DB.activity;
import LRU from 'lru-cache';
const cache = LRU({maxAge: 1000 * 60 * 5 });


// http://img.cdn.baca.co.id/event/top10/avatar/1.png
const getRandom = function(min ,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

const getFixed = function (v){
    let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
}

export default class extends Base {

    // 获取所有的评论列表
    async listAction(){
        // if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { page=1 } = this.get();
        const localData = cache.get('top-comments-page-'+page);
        if(localData && localData.length > 0) return this.success(localData);

        let model = this.model('top_comments' ,db);
        let comments = await model.field('avatar,content,addtime').page(page, 10).order('id desc').select();
        cache.set('top-comments-page'+page ,comments);
        return this.success(comments);
    }

    async addAction(){
        // if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { comment ,name='-' } = this.post();
        const ip = this.ip();
        let model = this.model('top_comments' ,db);
        let avatar_img = getRandom(1,16)+'.png';
        let new_id = await model.add({
            name : name, // 发起用户姓名
            avatar : avatar_img ,
            content : comment ,
            ip : ip
        });
        if(new_id > 0) {
            cache.reset();
            return this.success(avatar_img);
        }else{
            return this.fail(-2,'添加失败！');
        }
    }
}   