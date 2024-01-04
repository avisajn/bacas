'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';

const db = DB.activity;

export default class extends Base {

    // 设置中奖
    async setprizeAction(){
        return this.fail(-1 ,'not allow'); 
        let {ids , pnm:prize_name } = this.post();
        if(!ids||!prize_name) return this.fail(-1,'参数错误！');

        let model_film_user = this.model('campagin9girl' ,db); //prizename='123'
        const res = await model_film_user.where(`id in (${ids})`).update({prizename:prize_name});
        return this.success({num:res ,res:'设置成功！'});
    }

    // 设置中奖
    async removeAction(){
        return this.fail(-1 ,'not allow'); 
        let {ids} = this.post();
        if(!ids) return this.fail(-1,'参数错误！');

        let model_film_user = this.model('campagin9girl' ,db); //prizename='123'
        console.log('ids:',ids);
        const res =  await model_film_user.delete({where:{id:['IN',ids]}});
        return this.success({num:res ,res:'删除成功！'});
    }

    // 获取已经中奖的用户
    async queryprizeAction(){
        return this.fail(-1 ,'not allow'); 
        let model_film_prize = this.model('campagin9girl' ,db);
        const userList = await model_film_prize
                                .field('name,phone,address,select_img img,res_json res,prizename')
                                .where(`prizename is not null`)
                                .select();
        if(userList.length<=0) return this.success([]);
        userList.map((k) => {
            try{
                const res = JSON.parse(k.res);
                const _al = {};
                res.map((j) => {
                    _al['_'+j.k] = j.v[0];
                })
                k.res = _al;
            }catch(e){
                k.res = {};
            }
        })
        return this.success(userList);
    }

    // 查询用户列表 - 一口气返回所有的
    async queryuserAction(){
    return this.fail(-1 ,'not allow');  
        let model_film_standing = this.model('campagin9girl' ,db);
        let list = await model_film_standing.query(`select max(id)id,name,phone,max(address)address,max(select_img)girl,max(res_json)res from campagin9girl where res_json is not null and prizename is null group by name,phone order by id desc;`);
        if(list.length<=0) return this.success([]);
        list.map((k) => {
            try{
                const res = JSON.parse(k.res);
                const _al = {};
                res.map((j) => {
                    _al['_'+j.k] = j.v[0];
                })
                k.res = _al;
            }catch(e){
                k.res = {};
            }
        })
        return this.success(list);
    }

}   