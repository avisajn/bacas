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

const blobService = azure.createBlobService('baca', 'AlfJeE0T/a0hWMXRTR0oYj7GVxhvNAkL+brSotrJqzWmsabcEGJBL57fvMFTe01tHidrvBGWihYmAE6o16ORBA==');

function readFiles(_path){
    let fileList = [];
    const walk = function(path){  
        var dirList = fs.readdirSync(path);
        dirList.forEach(function(item){
            if(fs.statSync(path + '/' + item).isDirectory()){
                walk(path + '/' + item);
            }else{
                fileList.push(path + '' + item);
            }
        });
    }
    walk(_path);
    return fileList;
}

const uploadFile = function(file_path ,to_path,country){
    let name = file_path.substring(file_path.lastIndexOf('/')+1);
    // console.log('name:' ,name);
    return new Promise((r ,f) => {
        // return r({});
        blobService.createBlockBlobFromLocalFile(container, to_path+name, file_path, function(error, result, response) {
            if (error || !response.isSuccessful) {r({error}); return; }
            r({error ,url:cdnHost[country] + to_path+name});
        });
    })
};



export default class extends Base {

    async uploadAction(){
        const path = '/Users/wangxiaowei/Desktop/tinified/';
        const to_path = 'event/gc/img/';
        // const to_path = 'payloan/banner/';
        let file_lists = null;
        const urls = [];
        try{
            file_lists = readFiles(path);
        }catch(e){
            console.log(e);
            return this.fail(-1,'读取目录错误！');
        }
        for(let i=0,len=file_lists.length;i<len;i++){
            const {error ,url} = await uploadFile(file_lists[i] ,to_path,'id');
            if(error){
                console.log('error:' ,file_lists[i]);
            }else{
                urls.push(url);
                console.log('url:',url)
            }
        }
        return this.success(urls);
    }
 

}   