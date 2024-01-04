var Local = require('./local.js');
var request = require('superagent');
var Agent = require('agentkeepalive');
var _config = {
	method : 'get',
	url : '',
	version : 30030,
	userId : 'NIP_WEB_Anonymous',
	appName:'Baca-Wap',
	module:'',
	urlKey:'',
	paramFilter:false,
	param:{},
}


var _window = null;
var _lan = null;

module.exports = {
	setWindow : function(o){
		_window = o;
	},
	getData : function(config ,resolve){
		config = Object.assign({}, _config, config)

		var _hostname = config.host;
		if(_window){
			_hostname = window.location.hostname;
		}

	    if(_hostname.indexOf('localhost') >= 0){ 
	    	_lan = 'test';
	    }else{
	    	if(_window){
	    		_lan = window.lan;
	    	}else{
	    		_lan = global.language;
	    	}
	    	
	    }
		var param = config.param;
		var req = request;

		var _url = null,
			_header = {},
			baseurl = null;

		if(config.module.indexOf('trend') >= 0){
	      	baseurl = Local[_lan]['trendingBase'];
	    }else{
	    	baseurl = Local[_lan]['interfaceUrl']
	    }

	    if(config.url){
	    	_url = config.url;
	    }else{
	    	_url = Local['base']['interfaceModel'][config.module];
			if (config.urlKey && _url.indexOf('{?}') > 0) {
		    	_url = _url.replace('{?}', config.urlKey)
		  	}
	    }


	    if(config.keepalive){	// 对于服务端调用news的请求，需要加上一个keep-alive
	    	var keepaliveAgent = new Agent({
			  maxSockets: 100,
			  maxFreeSockets: 10,
			  timeout: 60000,
			  keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
			});
			req = req.agent(keepaliveAgent);
	    }

	  	_url = baseurl + _url;

	  	if(_window){
	  		_header = _window.header;
	  	}else{
	  		if(config.header){
	  			_header = config.header;
	  		}else{
		  		_header = {
		  			'X-APP-VERSION' : config.version,
		  			'X-User-Id' : config.userId, 
		  			'X-App-Name'    : config.appName,
		  			// 'X-Device-Platform'    :'Web'
		  		}
	  		}
	  	}

	  	// console.log('_header_header_header_header:' ,_header);

	  	if (config.method === 'get') {
	      req = req.get(_url)
	    } else if (config.method === 'post') {
	      req = req.post(_url)
	    } else if (config.method === 'put') {
	      req = req.put(_url)
	    } else if (config.method === 'delete') {
	      req = req.delete(_url)
	    }
	    // req = req.timeout(7000);
	
	    if (config.method === 'get') {
	            // 参数
	      	if (config.paramFilter) {
	        	req = req.query(JSON.stringify(param))
	      	} else {
	        	req = req.query(param)
	      	}
	    } else {
	      	if (param) {
	        	req = req.send(param)
	      	}
	    }

	    req = req.set(_header);
	    req.end(function (err, res) {
	    	if(_window) window.ajaxReq = null;

	      	if (err || !res) {
		        console.error('请求接口：' + _url + '时，遇到了问题0:')
		    	if (typeof(err.timeout) != 'undefined') { 
		    		resolve({timeout :err.timeout});
		    		return;
		    	}
		        resolve({ err:err.toString() })
		        return
	      	}
	      	if (res.error) {
		        console.error('请求接口：' + _url + '时，遇到了问题1:')
		        // console.error(res.text)
		        resolve({ err:res.text })
		        return
	      	}

	      	res = res.text || '{}'
	      	res = JSON.parse(res)
		    if (res.errno < 0) {
		        console.error('请求接口：' + _url + '时，遇到了问题2:')
		        // console.error(res)
		        resolve({ err:res.errmsg, errno:res.errno })
		        return
	      	}
	      	resolve(res || {})
	    });
	    if(_window) {
		    window.ajaxReq = {
		    	module : config.module,
		    	value : req
		    };
	    }
	},
	logger : function(config ,resolve){
		config = Object.assign({}, {
			    "user_id": "",
			    "imei": "",
			    "app_id": "",
			    "app_version": "",
			    "channel": "",
			    "platform": "Web",
			    "google_ad_id": "",
			    "google_ad_status": "",
			    "event_type": "", 
			    "event_sub_type": "",
			    "event_time": (new Date()).toISOString(),
			    "event_value": "",
			    "host" : ""
			}, config);

		var _lan;

		var _hostname = config.host;
		if(_window){
			_hostname = window.location.hostname;
		}

	    if(_hostname.indexOf('localhost') >= 0){ 
	    	_lan = 'test';
	    }else{
	    	if(_window){
	    		_lan = window.lan;
	    	}else{
	    		_lan = global.language;
	    	}
	    }

	    var baseurl = Local[_lan]['interfaceLog'],
			_header = {};

		if(_window){
	  		_header = _window.header;
	  		config['user_id'] = _header['X-User-Id'];
	  		config['app_version'] = _header['X-APP-VERSION'];
	  	}else{
	  		config['user_id'] = config.userId;
	  		config['app_version'] = config.version;
	  	}

	  	var req = request;
	  	req = req.post(baseurl).send(config);
	  	req.end(function (err, res) {
	    });
	}
}