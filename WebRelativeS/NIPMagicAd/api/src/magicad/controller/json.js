'use strict';
import azure from 'azure-storage';
import moment from 'moment';
import Base from './base.js';
import fs from 'fs';

import LRU from 'lru-cache';
const cache = LRU({ maxAge: 1000 * 60 * 60 });

const blobService = azure.createBlobService('nipcleantool', '7kAN5quppIjeVs5KvAtC1UXcP1UBwgWJzIvWXNtosa4ZYf7Z20jmVncM8VaQtGGJPjfCivzvnIBN41BZfYjYQg==');

const basePath = think.RUNTIME_PATH + '/json/';
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

writeFile = function (name, jsonData) {
    let file_path = basePath+name ;
    return new Promise((r ,f) => {
        fs.writeFile(file_path,JSON.stringify(jsonData),function(e){
            r();
        })
    });
},

getFile = function(name ,cname){
    let file_path = basePath+name ;
    let stream = fs.createWriteStream(file_path);
    return new Promise((r ,f) => {
        blobService.getBlobToStream(cname, name, stream, function(error, result, response) {
            if (error!=null && typeof(error) != 'undefined' ) return r({err:JSON.stringify(error.message)}); 
            const data = fs.readFileSync(file_path,"utf-8"); ;
            return r(JSON.parse(data));
        });
    })

},

getList = function(cname){
    return new Promise((r ,f) => {
        const path = 'https://nipcleantool.blob.core.windows.net/resources/';
        blobService.listBlobsSegmented(cname, null, function(error, result, response) {
            if (error!=null && typeof(error) != 'undefined' ) return r({err:JSON.stringify(error.message)}); 
            const res = [];
            result.entries.map(({name}) => {
                if(name.indexOf('.json') >= 0) res.push({name:name});
            })
            return r(res);
        });
    })

},


uploadFile = function(name ,cname){
    return new Promise((r ,f) => {
        blobService.createBlockBlobFromLocalFile(cname, name, basePath+name ,{
            contentSettings : {
                contentType : 'application/json',
                cacheControl : 'public, max-age=300'
            }
        }, function(error, result, response) {
            if (error!=null && typeof(error) != 'undefined' ) return r({err:JSON.stringify(error.message)}); 
            r();
        });
    })

}


export default class extends Base {
    // 返回处理后的列表
    async getAction(){
        const {cname} = this.get();
        if(!cname) return this.fail(-1,'参数错误！');
        const local = cache.get('json-list-'+cname);
        if(local) return this.success(local);
        const list = await getList(cname);
        cache.set('json-list-'+cname ,list);
        return this.success(list);
    }



    async getjsonAction(){
        const {name ,cname} = this.get();
        if(!name || !cname) return this.fail(-1);
        const local = cache.get('json-'+cname+'-'+name);
        if(local) return this.success(local);
        const content = await getFile(name ,cname);
        if(content.err) return this.fail(content.err);
        cache.set('json-'+cname+'-'+name ,content);
        return this.success(content);
    }

    async createjsonAction(){
        const {name ,appname ,configname ,expireinseconds ,cname} = this.post();
        if(!cname || !name || !appname || !configname || !expireinseconds) return this.fail(-1);
        await writeFile(name ,{
            AdUnitDetails : {},
            AppName : appname ,
            ConfigName : configname,
            ExpireInSeconds : expireinseconds
        })
        await uploadFile(name ,cname);
        cache.del('json-list-'+cname);
        return this.success('提交成功！');
    }

    async testAction(){
        await uploadFile('adconfig_goclean.json' ,'test');
        return this.success('提交成功！');
    }

    async submitcontentAction(){
        const {k,name ,cname} = this.post();
        if(!k || !name || !cname) return this.fail(-1);
        let jsonData = null;
        let AdUnitDetails = null;
        try{
            jsonData = JSON.parse(k);
            AdUnitDetails = jsonData.AdUnitDetails;
        }catch(e){
            return this.fail(-2);
        }
        const trueData = {};
        AdUnitDetails.map((k) => {
            delete k.editble;
            delete k.i;
            delete k.clone;
            const _type = k.Type;
            delete k.Type;
            if(!trueData[_type]) trueData[_type] = [];
            trueData[_type].push(k);
        });
        jsonData['AdUnitDetails'] = trueData;
        // 第一步，将JSON内容写入文件中
        await writeFile(name ,jsonData)
        // 第二步，提交到Storage中
        const res = await uploadFile(name ,cname);
        // 清空服务器缓存
        cache.del('json-'+cname+'-'+name);
        return this.success(res); 
    }

}   