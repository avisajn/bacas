import Fetch from './fetch';
import Store from './store';
import {decryptCode ,encryptCode} from './des';
import MD5 from 'blueimp-md5';

let getSession = function(url ,sessionName){
	let sessionData = Store.getSession(sessionName);
	if(typeof(sessionData) == 'object' && sessionData){
		return new Promise((resolve ,reject) => {
			resolve(sessionData);
		});
	}
	return new Promise((r ,j) =>{
		Fetch(url).then((d) =>{
			Store.setSession(sessionName ,d);
			r(d);
		});
	})
}


export default {

	sys : {
		getList(param){
			return Fetch('/sys' ,{method : 'get' ,body:param});
		},
		saveSys(param){
			if(param.id){
				return Fetch('/sys/'+param.id ,{method : 'put' ,body:param});	
			}else{
				return Fetch('/sys/' ,{method : 'post' ,body:param});	
			}
		},

		getAllSysInfo(){
			return Fetch('/sys/all' ,{method : 'get'});
		},

		saveSysInfo(param){
			if(param.id){
				return Fetch('/sysinfo/'+param.id ,{method : 'put' ,body:param});	
			}else{
				return Fetch('/sysinfo/' ,{method : 'post' ,body:param});	
			}
		},

		getInfoList(id){
			return Fetch('/sysinfo' ,{method : 'get' ,body:{sysid:id}});
		}
	},

	role : {
		getList(param){
			return Fetch('/role' ,{method : 'get' ,body:param});
		},
		saveRole(param){
			if(param.id){
				return Fetch('/role/'+param.id ,{method : 'put' ,body:param});	
			}else{
				return Fetch('/role/' ,{method : 'post' ,body:param});	
			}
		},

		setPermisstion(param){
			return Fetch('/rolesys/setrolesys' ,{method : 'post' ,body:param});	
		},

		getInfoList(id){
			return Fetch('/role/'+id ,{method : 'get' ,body:{roleid:id}});
		},

		delete(id){
			return Fetch('/role/'+id ,{method : 'delete'});
		}
	},

	user : {
		getList(param){
			return Fetch('/user' ,{method : 'get' ,body:param});
		},
		saveUser(param){
			if(param.id){
				return Fetch('/user/'+param.id ,{method : 'put' ,body:param});	
			}else{
				return Fetch('/user/' ,{method : 'post' ,body:param});	
			}
		},

		getPermisstion(userid ,rids){
			return Fetch('/user/'+userid ,{method : 'get' ,body:{rids :rids}});	
		},

		delete(id){
			return Fetch('/user/'+id ,{method : 'delete' ,body:{userid:id}});
		}

	},


	login : {
		login(username ,password){
			const code = encryptCode({username:username,password:MD5(password)});
			return Fetch('/login/' ,{method : 'post' ,body:{data:code}});	
		},
		out(){
			return Fetch('/login/out' ,{method : 'post'});	
		},
		resetPwd(param){
			const code = encryptCode({
				old:MD5(param.oldpwd),
				new:MD5(param.password) ,
				username : window.userData.username
			});
			return Fetch('/login/resetpwd' ,{method : 'post' ,body:{data:code}});	
		}
	},






};