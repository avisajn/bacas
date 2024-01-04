var request = require('superagent');


var _baseUrl =  'http://idcrawler.vm.newsinpalm.net/magicadapi';

if(window.location.origin.indexOf('localhost') > 0){
  _baseUrl = 'http://localhost:8360';
}

// _baseUrl = 'http://idevent-test.azurewebsites.net/api/tvevent';

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
  	if (res.error) {resolve({ err:res.text }) ;return ;}

  	res = res.text || '{}'
  	resolve(JSON.parse(res) || {})
  });
}

module.exports = {

  // 得到一个用户
  saveuser : function(param ,resolve){
    getData({url : '/api/tuser/saveuser' ,param:param ,method:'post'} ,resolve);
  },
}