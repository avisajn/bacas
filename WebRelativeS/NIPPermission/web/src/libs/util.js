import Store from './store';
import API from './api';

let _getRight = function(sysData ,sysid){
	let pages = {};
	let sys = null;
	let isHave = false;
	sysData.map((k) => {
		if(k.id == sysid){
			isHave = true;
			k.permisstion.map((j) => {
				pages[j.key] = true;
			})
		}
	});
	if(!isHave){return null; }
	return pages;
}
var Util = {
	// 得到保留两位小数的结果
	getFixed(v){
		let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
		return new Number(fixNum - 1).toFixed(2);
	},

	getAllSystem(callback){
		let sysData = Store.getSession('sys');
		if(!sysData){
			let self = this;
			let user = window.userData;
			if(!user){return;}
			API.user.getPermisstion(user.id ,user.roleids).then((k) => {
	            sysData = self.getSysFormatterData(k);
	            if(callback) callback(sysData);
	            return;
	        })
		}else{
			if(callback) callback(sysData);
		}
	},


	getRights(sysid ,callback){
		let sysData = Store.getSession('sys');
		let self = this;
		this.getAllSystem(function(d){
			if(callback) callback(_getRight(d, sysid));
		})
	},

	getSysFormatterData(data){
		let system = {};
	    if(data.length <= 0){
	        // 没有任何权限
	        window.location.href = '#!/help';
	        return;
	    }
	    let systemName = [];
	    data.map((k) => {
	        if(!system[k.sysid]){
	            system[k.sysid] = [];
	            systemName.push({
	                id : k.sysid,
	                name : k.sysname,
	                url : (k.url?k.url:k.testurl) 
	            });
	        }
	        console.log('f');
	        system[k.sysid].push({type : k.type, key : k.key})
	    });
	    systemName.map((k) => {
	        k.permisstion = system[k.id];
	    });
	    Store.setSession('sys' ,systemName);
	    return systemName;
	},


	getQuery(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		let hash = window.location.hash;
        var r = hash.substr(hash.indexOf('?')+1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
	}
}




export default Util;