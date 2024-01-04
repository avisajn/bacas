'use strict';
import azure from 'azure-storage';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';
var csv = require('csv');

const db = DB.permisson;

export default class extends Base {
    // // 返回处理后的列表
    // async getadunitAction(){
    //     const model = this.model('adunit' ,db);
    //     const data = await model.field('id,name,creative_ratio,creative_size_limitation').where({app:'baca'}).select();
    //     // data.map((k) => {
    //     //     k.name = k.name+'_'+(parseInt(k.index)+1);
    //     //     delete k.index;
    //     // })
    //     return this.success(data);
    // }

    // 返回所有的发布人
    async getAction(){
        const model = this.model('temp_users' ,db);
        const data = await model.field('email,name,birthdate,phone,card,city,sex,addtime,platform').where("email not like '%12%'").select();
        

        // const fileName= "data.xls";
        // const _http = this.http;
        // _http.header('Content-Type', 'application/vnd.ms-execl');
        // _http.header('Content-Disposition', "attachment;filename="+encodeURIComponent(fileName));
        // _http.header('Pragma', 'no-cache');
        // _http.header('Expires', 0);

        const content = [];

        data.map((k ,i) => {
            k.sex = k.sex == '1' ? 'male' : 'female';
            k.card = k.card == '1' ? 'yes' : 'no';
            // if(i == 0){ content.push(`email\tname\tbirthdate\tphone\tcard\tcity\tsex`); }
            // content.push(`${k.email}\t${k.name}\t${k.birthdate}\t${k.phone}\t${k.card}\t${k.city}\t${k.sex}`);
        })
        // _http.write(content.join('\n'));
        this.json(data);
    }



    // 返回所有的发布人
    async saveuserAction(){
        let param = this.post();
        let name = param.name;
        if(!param['email'] || !param['name'] || !param['phone'] || !param['birthdate'] || !param['city']){
            return this.fail(-1 ,'参数不正确');
        }
        let model = this.model('temp_users' ,db);
        const id = await model.add({
            email : param['email'],
            name : param['name'],
            birthdate : param['birthdate'],
            phone : param['phone'],
            card : param['card'],
            platform : param['platform'],
            city : param['city'],
            sex : param['sex'],
        })
        if(id){
            return this.success(id);
        }else{
            return this.fail(-1 ,id);
        }
    }

}   