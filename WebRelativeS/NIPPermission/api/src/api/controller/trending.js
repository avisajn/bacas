'use strict';
let DateFormat = require('dateformat');
import Base from './baserestnone.js';
import moment from 'moment';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    async getAction(){
        let model = this.model('trending',db);
        if(this.id){
            const news_id = this.id;
            let list = await model.field('news_id,new_news_id').where(`new_news_id='${news_id}' and status=1`).select();
            return this.success(list);
        }else{
            const before_date = moment().subtract(5, 'days').format('YYYY-MM-DD');
            const today = moment().format('YYYY-MM-DD');

            let list = await model.field('news_id,new_news_id').order('id desc').where(`addtime<='${today} 23:59:59' and addtime>='${before_date} 00:00:00' and status=1`).select();
            return this.success(list);
        }
        
    }

    // 添加一条数据
    async postAction(){
        let param = this.post();
        let news_id = param.news_id,
            new_news_id = param.new_news_id;
        const time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss")

        if(!news_id){return this.fail(-1 ,'参数不正确'); }
        let model = this.model('trending',db);
        await model.add({news_id : news_id, new_news_id : new_news_id ,addtime:time ,status:0 })
        return this.success('添加成功！');
    }


    // 修改一条数据
    // 发布： 把状态改为1
    async putAction(){
        let param = this.post();
        let news_ids = param['news_ids'];
        if(!news_ids){
            return this.fail(-1 ,'参数不正确');
        }
        let ids = [];
        if(news_ids.indexOf('-') > 0){
            news_ids = news_ids.split('-');
            news_ids.map((k) => {
                ids.push("'"+k+"'");
            })
        }else{
            ids.push("'"+news_ids+"'");
        }
        let model = this.model('trending',db);
        let insertId = await model.where('new_news_id in ('+ids.join(',')+')').update({status:1});
        return this.success('修改成功');
    }
}