var express = require('express'),
    router = express.Router();

var Base64 = require('js-base64').Base64;

var Local = require('../../client/util/local.js');
var newsData = require('../../client/util/newsdata.js');

var Country = Local[global.language];

router.get('/', function(req, res) {
    var baseUrl = 'http://event.cennoticias.com';
    if(global.language == 'bx'){
      baseUrl = 'http://event.cennoticias.com';
    }else{
      baseUrl = 'http://event.baca.co.id';
    }
    res.render('create',{Country : Country ,PageText : Country['language']['page-info'],Lan : global.language ,Url:baseUrl }); 
});

router.get(/^\/(.*?)$/, function(req, res) {
  const uid = req.params[0];
  if(!uid){
    res.send('没有参数！');
    return;
  }
  var param = Base64.decode(uid);
  if(!param || param.indexOf('=') == -1){
    res.send('参数错误！');  
    return;
  }
  // console.log('')
  
  param = param.split('=');
  const mk_id = param[0];
  if(mk_id < 0){
    res.send('暂时没有模版');
    return;
  }
  
  const header = JSON.stringify({
    'X-User-Id' : "v_"+req.get('X-User-Id'),
    'X-User-Id2' : "v_"+req.get('x-user-id'),
    'X-User-Name' : "v_"+req.get('X-User-Name'),
    'X-User-Name2' : "v_"+req.get('x-user-name'),
    'Referer' : req.get('Referer'),
    'Cookie' : req.get('Cookie'),
  });
  console.log('header====================>',header);
  const sex = param[1];
  const name = param[2];
  const body = newsData.getNews(mk_id ,sex ,name);
  var baseUrl = 'http://event.cennoticias.com';
  if(global.language == 'bx'){
    baseUrl = 'http://event.cennoticias.com';
  }else{
    baseUrl = 'http://event.baca.co.id';
  }
  res.render('info',{
      Country : Country ,
      PageText : Country['language']['page-info'],
      Title : body.title ,
      Author : body.author,
      Comment : body.comment,
      Avatar : body.avatar,
      Content : body.content ,
      Img : body.img,
      Url : baseUrl+req.path,
      PraiseNum : param[3],
      ComPNum : param[4],
      DateTime : param[5],
      Lan : global.language,
      header : header
  });

});



module.exports = router;