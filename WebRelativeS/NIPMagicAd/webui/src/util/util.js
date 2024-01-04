
export default {
	getQuery(name){

		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		const hash = window.location.hash;
		var r = hash.substring(hash.indexOf('?')+1).match(reg);
		if(r!=null)return  unescape(r[2]); return null;
		
	}
}