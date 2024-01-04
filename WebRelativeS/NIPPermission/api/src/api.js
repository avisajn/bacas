import superAgentRequest from 'superagent';
import { encryptCode } from './util.js';

export default {
	getUserId(){

		return Fetch({
			url:'http://adnetwork.hadoopfinetech.com/adnetwork/apply_for_account' ,
			method:'get', 
			body : { 
				code : encryptCode({time:(new Date().getTime() +  5 * 60 * 1000)}),
			}
		});
	},



};

const Fetch = function(config){
	return new Promise((resolve ,f )=>{

		config.method = config.method || 'get';
		var _url =  config.url;
		// if(!config.notCross) _url = _baseUrl + _url; 
		var body = config.body;
		console.log('开始请求:', new Date().getTime()+':' ,_url ,JSON.stringify(body||{}));
		var req = superAgentRequest;

		if (config.method === 'get') req = req.get(_url);
		else if (config.method === 'post') req = req.post(_url);
		else if (config.method === 'put') req = req.put(_url);
		else if (config.method === 'delete') req = req.delete(_url);

		if(body){
			if (config.method === 'get') req = req.query(body);
			else req = req.send(body); 
		}

		if(config.attach) req = req.set('enctype', 'multipart/form-data');
		if(config.withCredentials) req = req.withCredentials(true);

		req.end(function (err, res) {
			if (err || !res) { resolve({ err:err.toString() }) ;return ;}
			if (res.error) {resolve({ err:res.text }) ;return ;}

			res = JSON.parse(res.text || '{}');
			if (res.errno < 0) {
			  resolve({ err:res.errmsg, errno:res.errno })
			  return
			}
			console.log('结束请求:', new Date().getTime() ,JSON.stringify(res));
			resolve(res || {});
	  	});
	})
}