'use strict';
import Base from './base.js';
import DB from '../../db.js';
const db = DB.dbpermission;

export default class extends Base {
    // 登录验证
    async indexAction(){
        if(this.http.method != 'POST'){return this.fail(-1,'参数错误'); }
        const sysId = this.get().sysid;
        const rids = this.getRids();
        let model = this.model('rolesys' ,db);
        let list = await model.field('si.`key`,si.type').alias('base')
                         .join([ 'sys s on s.id=base.sysid ','sysinfo si on si.id=base.sysinfoid'])
                         .where('roleid in ('+rids+') and base.sysid='+sysId).select();

        const user = this.getUser();
        return this.success({
            list : list ,
            country : user.country,
            username : user.username
        });
    }

}