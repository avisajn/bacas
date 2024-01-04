'use strict';
import azure from 'azure-storage';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';


const container = 'news-images';
const cdnHost = {
    id : 'http://img.cdn.baca.co.id/',
    br : 'http://img.cdn.baca.co.id/'
}


const db = DB.dbmagicad;

const blobService = azure.createBlobService('baca', 'AlfJeE0T/a0hWMXRTR0oYj7GVxhvNAkL+brSotrJqzWmsabcEGJBL57fvMFTe01tHidrvBGWihYmAE6o16ORBA==');

const renameFile = function(tmp_path ,target_path){
    return new Promise((r ,f) => {
        // // 移动文件
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // 删除临时文件夹文件, 
            fs.unlink(tmp_path, function() {
                if (err) throw err;  
                r();
            });
        });
    })
},
// 处理上传图片上传文件的问题
uploadImage = function(name ,country){
    // 将文件路径放到file_path文件夹下
    let file_path = think.RUNTIME_PATH + '/upload/' + name;
    return new Promise((r ,f) => {
        blobService.createBlockBlobFromLocalFile(container, 'ads/'+name, file_path , function(error, result, response) {
            if (error || !response.isSuccessful) {r({error}); return; }
            r({error ,url:cdnHost[country] + 'ads/'+name});
        });
    })
},

uploadFile = function(name ,path ,country){
    return new Promise((r ,f) => {
        blobService.createBlockBlobFromLocalFile(container, 'event/top10/'+name, path+name , function(error, result, response) {
            if (error || !response.isSuccessful) {r({error}); return; }
            r({error ,url:cdnHost[country] + 'event/top10/'+name});
        });
    })
};



export default class extends Base {
    // 返回处理后的列表
    async getadunitAction(){
        const model = this.model('adunit' ,db);
        const data = await model.field('id,name,creative_ratio,creative_size_limitation').where({app:'baca'}).select();
        // data.map((k) => {
        //     k.name = k.name+'_'+(parseInt(k.index)+1);
        //     delete k.index;
        // })
        return this.success(data);
    }

    async uploadtestAction(){
        const path = '/Users/wangxiaowei/Desktop/tinified/';
        const names = [
            'abg-nikah.jpg',
            'ahok-rizieq.jpg',
            'darah.jpg',
            'dp-rumah.jpg',

            'julia.jpg',
            'pilkada.jpg',
            'raffi-ayu.jpg',
            'salman.jpg',
            'uang.jpg',
            'zakir.jpg',
        ];
        const urls = [];
        for(let i=0,len=names.length;i<len;i++){
            const {error ,url} = await uploadFile(names[i], path ,'id');
            if(error){
                console.log('error:' ,names[i]);
            }else{
                urls.push(url);
                console.log('url:',url)
            }
        }
        return this.success(urls);
    }
    
    async getadunitsAction(){
        const model = this.model('adunit' ,db);
        const data = await model.field("id,CONCAT(app,'_',name) as name,creative_ratio,creative_size_limitation").select();
        return this.success(data);
    }

    // 返回所有的发布人
    async getpublisherAction(){
        const model = this.model('publisher' ,db);
        const data = await model.field('id,publisher_name name').select();
        return this.success(data);
    }

    async getadtype(){
        const model = this.model('adtype',db);
        const data = await model.field('id,type').select();
        return this.success(data);
    }

    // 返回所有的发布人
    async savepublisherAction(){
        let param = this.post();
        let name = param.name;
        if(!name){
            return this.fail(-1 ,'参数不正确');
        }
        let model = this.model('publisher' ,db);
        const id = await model.add({publisher_name : name})
        if(id){
            return this.success(id);
        }else{
            return this.fail(-1 ,id);
        }
    }

    async deleteAction(){
        let {id} = this.post();
        if (!id) return this.fail('id为空！');
        let model_offer = this.model('offer' ,db);
        let insertId = await model_offer.where("id="+id).update({enable : 0});
        return this.success('删除成功！');
    }


    async saveofferAction(){
        let param = this.post();
        let name = param.name,                      // offer 表
            start_time  = param.start_time,         // offer 表
            end_time    = param.end_time,           // offer 表
            adunit_id   = param.adunit,           // offer 表
            publisher_id    = param.publisher,           // offer 表

            cpm    = param.cpm,           // offer 表
            ses_filter    = param.ses_filter || '',           // offer 表
            age_filter    = param.age_filter || '',           // offer 表
            gender_filter    = param.gender_filter || '',           // offer 表
            city_filter    = param.city_filter || '',           // offer 表

            width       = param.width,              // creative 表
            height      = param.height,
            cta         = param.cta_text,

            impression_cap      = param.impression_cap,
            click_cap      = param.click_cap,

            target_url  = param.target_url,
            click_callback_url  = param.click_callback_url,
            impression_callback_url     = param.impression_callback_url,
            title       = param.title,
            description     = param.description,
            creative_url    = param.creative_url,

            country     = 'id', // 默认的国家为印尼

            dateNow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

        if(!name){
            return this.fail(-1 ,'参数不正确');
        }

        let model_offer = this.model('offer' ,db);
        let model_creative = this.model('creative' ,db);

        const offer_param = {
            updated_time : dateNow,
            start_time : start_time,
            end_time : end_time,
            publisher_id : publisher_id,
            adunit_id : adunit_id,
            name : name,
            cpm : cpm,
            ses_filter : ses_filter,
            age_filter : age_filter,
            gender_filter : gender_filter,
            location_filter : city_filter,
        };

        if(impression_cap) offer_param['impression_cap'] = impression_cap;
        if(click_cap) offer_param['click_cap'] = click_cap;

        const offer_id = await model_offer.add(offer_param);

        if(!offer_id){
            return this.fail(-1 ,'插入offer出错！');
        }

        const creative_id = await model_creative.add({
            offer_id : offer_id,
            width : width,
            height : height,
            cta : cta,
            creative_url : creative_url,
            target_url : target_url,
            click_callback_url : click_callback_url,
            impression_callback_url :impression_callback_url ,
            title : title,
            description : description,
        });
        if(!creative_id){
            return this.fail(-1 ,'插入creative出错！');
        }
        return this.success({offer_id ,creative_id});
    }

    async getAction(){
        let {current=1 ,u}      = this.get();
        let where = ' base.enable = 1 ';
        if(!u){
            where += " and u.app='baca' ";
        }
        const model_offer = this.model('offer' ,db);
        const column = [
            'base.id as offer_id',
            'base.start_time as start_time',
            'base.end_time as end_time',
            'base.publisher_id as publisher_id',
            'base.impression_cap as impression_cap',
            'base.click_cap as click_cap',
            'base.adunit_id as adunit_id',
            'base.name as name',
            'base.cpm as cpm',
            'base.ses_filter as ses_filter',
            'base.age_filter as age_filter',
            'base.gender_filter as gender_filter',
            'base.location_filter as city_filter',
            'c.width as width',
            'c.height as height',
            'c.cta as cta',
            'c.creative_url as creative_url',
            'c.target_url as target_url',
            'c.click_callback_url as click_callback_url',
            'c.impression_callback_url as impression_callback_url',
            'c.title as title',
            'c.description as description'
        ]
        const list = await model_offer.alias('base').field(column)
                .join('creative c on c.offer_id = base.id')
                .join('adunit u on u.id = base.adunit_id')
                .where(where)
                .order('base.id desc').page(current,20).select();
        list.map((k) => {
            k.start_time_str = moment(k.start_time).add(7,'hour').format('YYYY-MM-DD HH:mm:ss');
            k.end_time_str = moment(k.end_time).add(7,'hour').format('YYYY-MM-DD HH:mm:ss');
            k.start_time = moment(k.start_time).add(7,'hour').format('YYYY-MM-DD');        
            k.end_time = moment(k.end_time).add(7,'hour').format('YYYY-MM-DD');  
        })
        return this.success(list);
    }

    async updimgAction(){
        const { offer_id ,creative_url ,width ,height } = this.post();
        if(!offer_id || !creative_url) return this.fail(-1,'参数错误！！！！！！！！！');

        let model = this.model('creative' ,db);
        let insertId = await model.where("offer_id="+offer_id).update({
            creative_url : creative_url, 
            width : width,
            height : height,
        });
        return this.success('修改成功！');
    }


    async uploadimageAction(){
        // 参考 https://github.com/Azure/azure-storage-node
        if(this.http.method!='POST'){
            return this.fail(-1);
        }
        let param = this.post(),
            start = param.start ,
            end = param.end,
            title = param.title;

        let file = this.http._file[0];

        if(!file || !start || !end || !title){
            return this.fail(-1 ,'参数错误！!!!');
        }

        let tmp_path = file.path,
            oldName = file.originalFilename,
            ext  = oldName.substring(oldName.lastIndexOf('.'));

        let name = encodeURI(title.replace(/\?| /g, '_'))+"_"+start+"_"+end+ext;

        let target_path = think.RUNTIME_PATH + '/upload/' + name;

        await renameFile(tmp_path ,target_path);

       
        
        const {error ,url} = await uploadImage(name ,'id');
        if(error){
            return this.fail(-1 ,'上传错误！'+JSON.stringify(error));
        }
        return this.success(url);
    }



}   