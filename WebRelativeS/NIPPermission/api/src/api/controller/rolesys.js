'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './base.js';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    async getAction(){
        
    }

    // 添加一条数据
    async setrolesysAction(){
        if(this.http.method != 'POST') return "";
        // 需要sysid, sysinfoid, roleid
        let param = this.post();
        if(!param.data || !param.roleid){
            return this.fail(-1,'参数错误');
        }
        let addList = [];
        let removeList = [];
        let data = param.data;
        let roleid = param.roleid;
        for(let sysid in data){
            if(data[sysid].length > 0){
                data[sysid].map((k) => {
                    addList.push({roleid:roleid, sysid:sysid ,sysinfoid:k});
                });
            }else{
                removeList.push(sysid);
            }
        }
        let model = this.model('rolesys',db);
        if(addList.length > 0){
            await model.addMany(addList,{},true);
            await model.execute('delete from rolesys where id not in (select * from (select min(id) as id from rolesys group by roleid,sysid,sysinfoid) as tmp)');
        }
        if(removeList.length > 0){
            await model.delete({where:{sysid: ["IN", removeList.join(',')], roleid:roleid} });
        }
       
        return this.success('添加成功！');
    }

   
}