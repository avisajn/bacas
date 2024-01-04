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
            let roleId = this.id;
            let model = this.model('rolesys',db);
            let list = await model.field('sysid,sysinfoid').where({roleid:roleId}).select();
            let resObj = {};
            let _id = null;
            list.map((k) => {
                _id = k.sysid;
                if(!resObj[_id]){
                    resObj[_id] = [];
                }
                resObj[_id].push(k.sysinfoid+"");
            })
            return this.success(resObj);
        }
        // 获取列表
        else{

            let params      = this.get() || {},
                key         = params.key,
                current     = params.current || 1,
                rowCount    = params.rowCount || 40;

            let where = {}
            // let where = {'adduser': this.getUserId() }
            if (key) { where['name'] = ['like', '%' + key + '%']; }

            let model = this.model('role',db);
            let list = await model.field('id,name,desc').page(current, rowCount).where(where).select();

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
        let model = this.model('role',db);
        await model.add({
            name : name,
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
        let id = param.id, name = param.name;
        if(!name){
            return this.fail(-1 ,'参数不正确');
        }
        let model = this.model('role',db);

        let insertId = await model.where({id: id }).update({
            name : name,
            desc : param.desc || '',
        });
        return this.success('修改成功');
    }

    async deleteAction(){
        let uid = this.id;
        if (!uid) return this.fail('id为空！');
        let model = this.model('role',db);
        await model.delete({where: {id: uid } });
        return this.success('删除成功！');
    }
}