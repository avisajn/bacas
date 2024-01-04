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
            let userid = this.id;
            let rids = this.get().rids;
            let model = this.model('rolesys',db);
            let list = await model.field('s.`name` sysname ,s.testurl ,s.url,s.id sysid,si.`key` ,si.type,si.`desc`').alias('base')
                             .join([ 'sys s on s.id=base.sysid','sysinfo si on si.id=base.sysinfoid'])
                             .where('roleid in ('+rids+')').select();
            return this.success(list);
        }
        // 获取列表
        else{

            let params      = this.get() || {},
                key         = params.key,
                current     = params.current || 1,
                rowCount    = params.rowCount || 30;

            let where = {}
            // let where = {'adduser': this.getUserId() }
            if (key) { where['username'] = ['like', '%' + key + '%']; }

            let model = this.model('user',db);
            let list = await model.field('id,country,username,roleids,addtime').alias('base').page(current, rowCount).where(where).select();
            if(list.length > 0){
                let roleids = [];
                list.map((k) => {
                    roleids.push(k.roleids);
                });
                let model_role = this.model('role',db);
                let _allroles = await model_role.field('id ,name').where("id in ("+roleids+")").select();
                let allroles = {};
                _allroles.map((k) => {allroles[k.id] = k.name; });
                let _ids = null;
                let _names = null;
                list.map((k) => {
                    _ids = k.roleids+"";
                    if(_ids.indexOf(',') > 0){
                        _ids = _ids.split(',');
                        k.roleids = _ids;
                        _names = [];
                        for(let i=0;i<_ids.length;i++){
                            _names.push(allroles[_ids[i]]);
                        }
                        k.rolesname = _names;
                    }else{
                        k.rolesname = [allroles[_ids]];
                        k.roleids = [_ids];
                    }
                });
            }

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
        console.log('param:',param);
        let username = param.username,
            password = param.password,
            roleids = param.roles,
            country = param.country,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        if(!username || !password || !roleids){
            return this.fail(-1 ,'参数不正确');
        }

        let model = this.model('user',db);
        await model.add({
            username : username,
            password : password,
            roleids : roleids||'-',
            country : country,
            addtime : time,
            status : 0,
        })
        return this.success('添加成功！');
    }

    // 修改一条数据
    async putAction(){
        if(!this.id){
            return this.fail(-1,'id为空！');
        }
        // {"id":19,"username":"raquel","password":"c6b49056b770f629f4acaecb61cbe609","roles":"8,11,6,4","country":"id"}
        console.log('1:')
        let param = this.post();
        let id = param.id, 
            username = param.username,
            country = param.country,
            roleids = param.roles;
        console.log('2:')
        if(!username || !roleids){
            return this.fail(-1 ,'参数不正确');
        }
        console.log('3:')

        //  select username,roleids,country from user where id=19;
        //  select * from user where id=19;
        //  update user set roleids='8,11,6,4,5',country='id' where id=19;
        let model = this.model('user',db);

        let insertId = await model.where({id: id }).update({
            username : username,
            roleids : roleids,
            country : country
        });
        console.log('insertId:',insertId);
        return this.success('修改成功');
    }

    async deleteAction(){
        let uid = this.id;
        if (!uid) return this.fail('id为空！');
        let model = this.model('user',db);
        await model.delete({where: {id: uid } });
        return this.success('删除成功！');
    }
}