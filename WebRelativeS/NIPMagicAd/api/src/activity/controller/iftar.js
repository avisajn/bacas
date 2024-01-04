'use strict';
import azure from 'azure-storage';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';

const db = DB.activity;

const container = 'activity-images';
const cdnHost = {
    id : 'http://baca-activity.azureedge.net/',
    br : 'http://baca-activity.azureedge.net/'
}


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

removeFile = function(path){
    return new Promise((r ,f) => {
        fs.unlink(path, function(err) {
            if (err) throw err;  
            r();
        });
    })
},

uploadImage = function(name ,country){
    let file_path = think.RUNTIME_PATH + '/upload/' + name;
    return new Promise((r ,f) => {
        blobService.createBlockBlobFromLocalFile(container, 'iftar/'+name, file_path , function(error, result, response) {
            if (error || !response.isSuccessful) {r({error}); return; }
            console.log('result:' ,result ,error);
            r({error ,url:cdnHost[country] + 'iftar/'+name});
        });
        // fileService.createDirectoryIfNotExists('taskshare', 'taskdirectory', function(error, result, response) {
        //   if (!error) {
        //     // if result = true, share was created.
        //     // if result = false, share already existed.
        //   }
        // });
    })

}



export default class extends Base {


    // 将图片上传到MagicAD的服务器
    async uploadimageAction(){
        return this.fail(-1 ,'not allow'); 
        if(this.http.method!='POST'){
            return this.fail(-1);
        }

        let param = this.post();
        let files = this.http._file;

        let len = 0;
        for(let k in files){len++; }
        if(len <= 0) return this.fail(-4,'张数不对！');

        // return this.success(think.RESOURCE_PATH);

        let target_path = think.RESOURCE_PATH + '/static/upd/';
        var names = [];
        for(let k in files){
            const file = files[k];
            const oldName = file.originalFilename;
            const ext  = oldName.substring(oldName.lastIndexOf('.'));
            const newName = new Date().getTime()+""+parseInt(Math.random()*1000);
            names.push(newName+ext);
            await renameFile(file.path ,target_path+newName+ext);
        }
        return this.success(names);
    }

    // 将图片上传到AZURE服务器
    async uploadAction(){
        return this.fail(-1 ,'not allow'); 
        // 参考 https://github.com/Azure/azure-storage-node
        if(this.http.method!='POST'){
            return this.fail(-1);
        }

        let param = this.post();
        let file = this.http._file.file;

        let tmp_path = file.path,
            oldName = new Date().getTime()+""+parseInt(Math.random()*1000),
            ext  = '.jpg';


        // return this.success('123123');
        let name = oldName+ext;

        let target_path = think.RUNTIME_PATH + '/upload/' + name;

        await renameFile(tmp_path ,target_path);
        return this.success({
            
        });
    }

    // 将图片上传到AZURE服务器
    async uploadazureAction(){
        return this.fail(-1 ,'not allow'); 
        // 参考 https://github.com/Azure/azure-storage-node
        if(this.http.method!='POST'){
            return this.fail(-1);
        }

        let param = this.post();
        let file = this.http._file.file;

        let tmp_path = file.path,
            oldName = new Date().getTime()+""+parseInt(Math.random()*1000),
            ext  = '.jpg';


        // return this.success('123123');
        let name = oldName+ext;

        let target_path = think.RUNTIME_PATH + '/upload/' + name;

        await renameFile(tmp_path ,target_path);

        const {error ,url} = await uploadImage(name ,'id');
        if(error){
            return this.fail(-1 ,'上传错误！'+JSON.stringify(error));
        }
        await removeFile(target_path);
        return this.success(url);
    }

    async setlikeAction(){
        return this.fail(-1 ,'not allow'); 

        let param = this.post();
        let _from    = param.from,
            _to   = param.to ,
            _type   = param.type ;

        if(!_from || !_to || !_type){return this.fail(-1 ,'参数不正确'); }
        let model = this.model('iftar_like' ,db);
        let paramObj = {user_id:_from ,iftar_id:_to };
        let count = await model.where(paramObj).count();
        if(_type == '1'){   // 添加
            console.log('count:' ,count);
            if(count == 0){
                let model_iftar = this.model('iftar' ,db);
                await model.add(paramObj);
                await model_iftar.execute('update iftar set `like`=`like`+1 where id='+_to);
            }
            return this.success('提交成功！');
        }else{  // 删除
            if(count > 0){
                let model_iftar = this.model('iftar' ,db);
                await model.delete({where: paramObj });
                await model_iftar.execute('update iftar set `like`=`like`-1 where id='+_to);
            }
            return this.success('取消成功！');
        }
    }

    async getlistAction(){
        return this.fail(-1 ,'not allow'); 
        let param = this.get() ,
            userid = param.id;

        let res = null;
        let model = this.model('iftar' ,db);
        if(userid){
            res = await model.field('base.id ,base.user_id ,base.like ,base.name,base.pic ,lk.id as islike')
                .alias('base')
                .join("iftar_like lk on lk.iftar_id=base.id and lk.user_id='"+userid+"'")
                .limit(0,100)
                .order('`like` desc')
                .select();
            res.map((k) => {
                if(k.islike){
                    k.islike = 1;
                }else{
                    k.islike = '';
                }
            })
            // console.log(res);
        }else{
            res = await model.field('id ,user_id, name, pic ,like , 0 as islike ').limit(0,100).order('`like` desc').select();
        }
        return this.success(res);
    }

    // 根据用户ID，获取相关内容
    async getbyidAction(){
        return this.fail(-1 ,'not allow'); 
        let param = this.get() ,
            userid = param.id;

        if(!userid ){return this.fail(-1 ,'参数不正确'); }

        let model = this.model('iftar' ,db);
        let res = await model.field('user_id, name, pic ,like ,id ').where("user_id='"+userid+"' ").order('id desc').select();
        if(res.length <= 0) {

            return this.fail(-2 ,'不存在！');
        }
        return this.success(res[0]);
    }
}   