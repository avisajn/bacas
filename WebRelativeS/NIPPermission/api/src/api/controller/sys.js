'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './baserest.js';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    async getAction(){
        //获取信息
        if(this.id && this.id == 'all'){
            // 获取所有系统，及系统的所有权限
            let model = this.model('sys',db);
            let model_info = this.model('sysinfo',db);
            let syslist = await model.field('id,name').select();
            let infolist = await model_info.select();
            let infoObj = {};
            let _id = null;
            let newList = [];
            infolist.map((k) => {
                _id = k.sysid;
                if(!infoObj[_id]){
                   infoObj[_id] = []; 
                }
                if(k.type == 1){
                    k.type = '页面';
                }else{
                    k.type = '功能';
                }
                infoObj[_id].push({
                    label : k.type ,
                    key : k.id+"",
                    name : k.key,
                    desc : k.desc
                });
            });
            return this.success({sys : syslist, info : infoObj });
        }
        // 获取列表
        else{

            let params      = this.get() || {},
                key         = params.key,
                current     = params.current || 1,
                rowCount    = params.rowCount || 30;

            let where = {}
            // let where = {'adduser': this.getUserId() }
            if (key) { where['name'] = ['like', '%' + key + '%']; }

            let model = this.model('sys',db);
            let list = await model.field('id,name,testurl,url').page(current, rowCount).where(where).select();

            let count = await model.where(where).count('id');

            return this.success({
              "current": current,
              "rowCount": rowCount,
              "rows": list,
              "total": count
            });
        }
    }

    // 添加一条数据
    async postAction(){
        let param = this.post();
        let name = param.name,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        if(!name){
            return this.fail(-1 ,'参数不正确');
        }
        let model_sys = this.model('sys',db);
        await model_sys.add({
            name : name,
            testurl : param.testurl || '',
            url : param.url || '',
            status : 0,
        })
        return this.success('添加成功！');
    }

    // 修改一条数据
    async putAction(){
        if(!this.id){
            return this.fail('id为空！');
        }

        let param = this.post();
        let id = param.id, name = param.name;
        if(!name){
            return this.fail(-1 ,'参数不正确');
        }
        let model_sys = this.model('sys',db);

        let insertId = await model_sys.where({id: id }).update({
            name : name,
            testurl : param.testurl || '',
            url : param.url || '',
        });
        return this.success('修改成功');
    }

    async deleteAction(){
        // let uid = this.id;
        // if (!uid) return this.fail('id为空！');
        // // 需要删除 课程表、课程目录表、课程内容表、课程结构表、课程分享表、试题表、纠错表
        // let model_course = this.model('course',db),
        //     model_coursecatalog = this.model('coursecatalog',db),
        //     model_coursecontent = this.model('coursecontent',db),
        //     model_coursemind = this.model('coursemind',db),
        //     model_courseshare = this.model('courseshare',db),
        //     model_question = this.model('question',db),
        //     model_buglog = this.model('buglog',db);

        // model_course.delete({where: {uid: uid } });
        // model_coursemind.delete({where: {cuid: uid } });
        // model_coursecatalog.delete({where: {cuid: uid } });
        // model_coursecontent.delete({where: {cuid: uid } });
        // model_courseshare.delete({where: {cuid: uid } });
        // model_question.delete({where: {cuid: uid } });
        // model_buglog.delete({where: {cuid: uid } });
        return this.success('删除成功！');
    }
}