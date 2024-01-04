'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './baserest.js';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    async getAction(){
        //获取信息
        if(this.id){
            return this.success('data');
        }
        // 获取列表
        else{

            let params      = this.get() || {},
                id          = params.sysid;

            if(!id){
                return this.fail(-1,'参数错误：sysid为空！');
            }

            let model = this.model('sysinfo',db);
            let list = await model.where({sysid:id}).select();
            return this.success(list);
        }
    }

    // 添加一条数据
    async postAction(){
        let param = this.post();
        let sysid = param.sysid,
            key = param.key;

        if(!sysid || !key){
            return this.fail(-1 ,'参数不正确');
        }
        let model_sysinfo = this.model('sysinfo',db);
        await model_sysinfo.add({
            sysid : sysid,
            type : param.type || 1,
            key : param.key || '',
            desc : param.desc || '',
        })
        return this.success('添加成功！');
    }

    // 修改一条数据
    async putAction(){
        if(!this.id){
            return this.fail('id为空！');
        }

        let param = this.post();
        let id = param.id, key = param.key ,sysid = param.sysid;
        if(!key || !sysid){
            return this.fail(-1 ,'参数不正确');
        }
        let model_sysinfo = this.model('sysinfo',db);

        let insertId = await model_sysinfo.where({sysid: sysid ,id:id}).update({
            key : param.key || '',
            type : param.type || 1,
            desc : param.desc || '',
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