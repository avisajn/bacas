'use strict';
import azure from 'azure-storage';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';

const db = DB.activity;

export default class extends Base {

    async saveAction(){
        return this.fail(-1 ,'not allow'); 

        let param = this.post();

        const count = param.count ;
        const time = param.time ;


        if(!param.userid || !param.name || !param.phone || !count || !time){
            return this.fail('参数错误！');
        }

        let model = this.model('iftar2_user' ,db);
        await model.add({
            no : param.no || param.userid,        // 用户编号
            userid : param.userid,    
            name : param.name,      // 用户名
            phone : param.phone,
            count : count,
            time : time,
        });
        
        // 然后根据次数和时间获取百分比
        let nums = await model.field('count(1) count').where('time >= '+time).select();
        nums = nums[0].count;
        let precent = 0;
        
        if(nums <= 1){
            if(time <= 7) precent = 99.9;
            else if(time <= 20) precent = 85;
            else if(time <= 45) precent = 67;
            else if(time <= 80) precent = 56;
            else if(time <= 130) precent = 45;
            else precent = 25;

        }else{
            let total = await model.field('count(1) count').select();
            total = total[0].count;
            console.log(nums ,total);
            precent = parseFloat(nums/total);
            if(precent == 1){
                precent = 0.9999;
            }
            precent = precent * 100;
        }



        return this.success({
            precent : precent+'%'
        });
    }


    async getAction(){
        return this.fail(-1 ,'not allow'); 
        let model = this.model('iftar2_user' ,db);
        let res = await model.field('group_concat(no) no, name,phone,sum(count) count,min(time) min_time,sum(time) sum_time').group('name,phone').order('count desc').select();
        return this.success(res);
    }

    async xlsAction(){
        return this.fail(-1 ,'not allow'); 
        const model = this.model('iftar2_user' ,db);
        let data = await model.field('group_concat(no) no, name,phone,sum(count) count,min(time) min_time,sum(time) sum_time').group('name,phone').order('count desc').select();
        

        const fileName= "data.xls";
        const _http = this.http;
        _http.header('Content-Type', 'application/vnd.ms-execl');
        _http.header('Content-Disposition', "attachment;filename="+encodeURIComponent(fileName));
        _http.header('Pragma', 'no-cache');
        _http.header('Expires', 0);

        const content = [];

        data.splice(0,0,`编号总和\t姓名\t手机号\t尝试次数\t最短用时\t总用时`);

        // data.map((k ,i) => {
        //     k.sex = k.sex == '1' ? 'male' : 'female';
        //     k.card = k.card == '1' ? 'yes' : 'no';
            // if(i == 0){ content.push(`email\tname\tbirthdate\tphone\tcard\tcity\tsex`); }
        //     // content.push(`${k.email}\t${k.name}\t${k.birthdate}\t${k.phone}\t${k.card}\t${k.city}\t${k.sex}`);
        // })
        _http.write(data.join('\n'));
        // this.json(data);
    }

}   