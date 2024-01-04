var express = require('express'),
    router = express.Router();

var Md5 = require("blueimp-md5");

var Local = require('../../client/util/local.js');
var Fetch = require('../../client/util/fetch.js');
const logger = require('../../log/logger');

var Country = Local[global.language];

// router.get('/', function(req, res) {
//     res.render('newslist',{
//       AdSearchId : Local['adSearchId'],
//     	Country : Country
//     });
// });

router.get(/^\/(\d+)?$/, function(req, res) {
  /// 关于userid的判断方法
  // 如果地址栏没有u这个参数的话，从cookie中取，如果cookie中没有，则认为是匿名的请求
  var params = req.query;
  var userId = params.u;
  var header = null;
  var isSetHeader = false;
  var cookiestr = req.get('Cookie');
  
  if(cookiestr && /hp={(.*?)}/gi.test(cookiestr) == true){
    cookiestr = /hp={(.*?)}/gi.exec(cookiestr)[0];
    cookiestr = decodeURIComponent(cookiestr.substring(3));
    header = JSON.parse(cookiestr);
  }else{
    isSetHeader = true;
    header = {
      'X-APP-VERSION' : 30030,
      'X-User-Id' : userId || 'NIP_WEB_Anonymous', 
      'X-App-Name' : 'Baca-Wap',
    }
  }

  if(!header['X-User-Id']){
    header['X-User-Id'] = 'NIP_WEB_Anonymous';
  }

  var ip = req.headers['x-forwarded-for'] || 
     (req.connection && req.connection.remoteAddress) || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

  var postParam = {onlyContent:false,pageId:params.pageId};

  if(typeof(params.m) != 'undefined' && typeof(params.n)!='undefined'){
    postParam['index'] = (params.m||0) - (params.n||0);
  }

  if(params.PageIndex==0){_pageIndex = 0; postParam['pageIndex'] = 0; }
  else{if(!params.PageIndex){}else{postParam['pageIndex'] = params.PageIndex; } }


  var startTime = new Date().getTime();
  Fetch.getData({
    host : req.hostname, 
    module : 'newsInfo', 
    urlKey : req.params[0] , 
    header : header,
    param  : postParam,
    keepalive : true 
  } ,function(e){
    var timeDiff = new Date().getTime() - startTime;
    var timeOut = timeDiff > 7 * 1000;
    if(e.err || e.timeout || timeOut){
      logger.error('<Detail:> '+JSON.stringify({
          id:params[0] ,
          err:e.err ,
          timeout:e.timeout ,
          'userAgent':req.get('User-Agent') ,
          'x-user-id':header['X-User-Id'],
          'uri-query': req.originalUrl,
          'client-ip' : ip,
          'time-taken' : timeDiff
      }));
      if(!timeOut){
        res.render('404',{Country : Country ,Direct:true}); 
        return; 
      }
    }
    if(isSetHeader){
      header['X-User-Id'] = 'wap_'+Md5(new Date().getTime());
      res.cookie('hp',JSON.stringify(header) , { maxAge: 60*60*1000 });
    }
    var html = null;
    if(e.Type == 3){
      const _video = e.Video;
      html = '<iframe _height="'+_video.Height+'" _width="'+_video.Width+'" id="videoFrame" src="'+_video.VideoUrl+'" class="videoIframe" > </iframe> ';
    }
    else if(e.Type == 0){
        html = e.Html;
        var startIndex = html.indexOf('<body>');
        var endIndex = html.indexOf('</body>');
        if(startIndex >= 0){html = html.replace(/<body>/g ,''); }
        if(endIndex >= 0){html = html.replace(/<\/body>/g ,''); }
    }else{html = e.Html; }
    if(e.Type == 2){e.Images = JSON.stringify(e.Images); }
    // 去掉空格和换行;
    e.Title = e.Title.replace(/\r|\n|\t/gi ,'');
    e.Abstract = e.Abstract || e.Title;
    e.Html = html;
    e.Cover = e.ImageGuids[0] || '';
    e.Country = Country;
    e.AdClient = Local['adClientId'];
    res.render('newsinfo' ,e);
  })
});

module.exports = router;