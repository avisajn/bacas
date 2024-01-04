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




	adreport : {
		getList({country='all' ,os='all' ,traffic_source ,datestart ,dateend}){
			
			return Fetch(`http://adnetwork.hadoopfinetech.com/adnetwork/adreport` ,{method : 'get' ,body:{
				country ,
				os ,
				traffic_source ,
				datestart ,
				dateend
			}});
		},
	},


	login : {
		login(username ,password){
			// console.log('padd:',password, MD5(password));
			// return;
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
		},

		setPwd(param){
			const code = encryptCode({
				old:MD5(param.oldpwd),
				new:MD5(param.password) ,
				id : param.id,
			});
			return Fetch('/user/setpwd' ,{method : 'post' ,body:{data:code}});	
		}
	},






};