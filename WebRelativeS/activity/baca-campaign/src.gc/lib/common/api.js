var request = require('superagent');
const CryptoJS = require('crypto-js');
const token = $('#100_t').val();
// const token = 'LV0dBae1Cd129cusdZnjW99kaEPJEat0XRvxRfw+hN8Bl2mK7bfLBewMLtZZFrN/mNKGzgvk884=';
var _baseUrl =  'http://idcrawler.vm.newsinpalm.net/magicadapi';

function encryptCode(obj) {
  var ciphertext = null;
  try{
    ciphertext = CryptoJS.AES.encrypt(JSON.stringify(obj), "only-test");
  }catch(e){
    return;
  }
  return ciphertext.toString();
}

if(window.location.origin.indexOf('localhost') > 0){
  _baseUrl = 'http://localhost:8360';
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
  	if (err || !res) return resolve({ err:err.toString() });
  	if (res.error || res.err) return resolve({ err:res.text });

  	res = JSON.parse(res.text || '{}');
    if (res.errno < 0) return resolve({ err:res.errmsg })
  	resolve(res.data || res);
  });
}

module.exports = {
  verifyPhone : function (str) {
    if(!str) return {err:'Maaf, nomor ponsel tidak sesuai, mohon periksa kembali.'};
    console.log('str:',str);
    const res = str.match(/^(\d{10,14})$/);
    if(!res || res.length <= 0) return {err:'Maaf, nomor ponsel tidak sesuai, mohon periksa kembali.'};
    return str;
  },
  getUserInfo : function (resolve) {
    if(token == '{{ymark-code}}') return resolve({err:'token 正确'});
    getData({url : '/activity/gc/user' ,method:'post' ,param:{t:token}} ,resolve);
  },

  // 得到一个用户
  getRanking : function(resolve){
    getData({url : '/activity/gc/ranking' ,method:'get'} ,resolve);
  },

  addUser:function(resolve){
    getData({url : '/activity/gc/adduser' ,method:'post' ,param:{
      name : $('#form_name').val(),
      phone : $('#form_phone').val(),
      city : $('#form_city').val(),
      sex : $('#form_sex').val(),
      userid : $('#200_t').val()||('----'+new Date().getTime()),
    }} ,resolve);
  },

  sub : function(time ,resolve){
    getData({url : '/activity/gc/add' ,method:'post' ,param:{
      t : encryptCode({
        t : token ,
        time : time,
        name : $('#form_name').val(),
        phone : $('#form_phone').val(),
        city : $('#form_city').val(),
      }),
    }} ,resolve);
  }
}