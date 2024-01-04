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

	getQuery(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		let hash = window.location.hash;
        var r = hash.substr(hash.indexOf('?')+1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
	}
}




export default Util;