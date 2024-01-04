var request = require('superagent');


var _baseUrl =  'http://idcrawler.vm.newsinpalm.net/magicadapi';

if(window.location.origin.indexOf('localhost') > 0){
  // _baseUrl = 'http://localhost:8360';
}

// _baseUrl = 'http://brcrawler.vm.newsinpalm.net/magicadapi/';

var getData = function(config ,resolve){
  config.method = config.method || 'get';

	var _url = _baseUrl + config.url;
	var param = config.param;
	var req = request;

	if (config.method === 'get') req = req.get(_url);
  else if (config.method === 'post') req = req.post(_url);
  else if (config.method === 'put') req = req.put(_url);
  else if (config.method === 'delete') req = req.delete(_url);

  if(param){
    if (config.method === 'get') {
        req = req.query(param)
    } else {
      	req = req.send(param)
    }
  }
  // req.withCredentials(true);
  req.header['X-Requested-With'] = 'XMLHttpRequest';
  req.end(function (err, res) {
  	if (err || !res) { resolve({ err:err.toString() }) ;return ;}
  	if (res.error || res.err) {resolve({ err:res.text }) ;return ;}

  	res = JSON.parse(res.text || '{}')
  	resolve(res.data || res);
  });
}

module.exports = {

  // 得到一个用户
  getComments : function(resolve){
    getData({url : '/activity/top/list' ,method:'get'} ,resolve);
  },

  sub : function(txt ,resolve){
    getData({url : '/activity/top/add' ,method:'post' ,param:{comment:txt}} ,resolve);
  }
}