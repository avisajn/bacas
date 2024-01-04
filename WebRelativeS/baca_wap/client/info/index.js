require("./index.scss");
require("../common/common.js");

require('../common/img/share.png');
require('../common/img/facebook.png');
require('../common/img/line.png');
require('../common/img/whatsapp.png');
require('../common/img/icons2.png');

var Local = require('../util/local.js');
var Fetch = require('../util/fetch.js');


document.body.scrollTop = 0;
var CountryLan = Local[window.lan]['language'];

$(function () {
    $('.body-placeholder').css({'opacity':0 ,'display':"none"});
    document.body.scrollTop = 0;
    const nid = window.Tools.getQuery('nid');
    getData(nid);
});

var times = 0;
var getData = function(nid){
    if(!nid){return; }
    Fetch.getData({
        module : 'newsInfo', 
        urlKey :  nid,
        userId : window.header['X-User-Id'],
        param  : {onlyContent:false,pageId:0,index:0,pageIndex:0},
    } ,function(e){
        if(e.err){
            times++;
            if(times < 5){
                setTimeout(function(){getData(nid); },500);
            }
            else{alert('已经尝试5次获取，应该是newsId出错了！或者服务端有问题！');}
            return;
        }
        var html = null;
        if(e.Type == 3){
             html = '<iframe src="'+e.Video.VideoUrl+'" class="videoIframe" > </iframe> '
        }else if(e.Type == 0){
            html = e.Html;
            var startIndex = html.indexOf('<body>');
            var endIndex = html.indexOf('</body>');
            if(startIndex >= 0){
                html = html.replace(/<body>/g ,'');
            }
            if(endIndex >= 0){
                html = html.replace(/<\/body>/g ,'');
            }
        }else{
          html = e.Html;
        }
        $('#createTime').html(e.CreatedAt);
        $('#publisher').html(e.Media);
        $('#title').html(e.Title);
        $('#articleDetail').html(html);
        Labels(e.Keywords);
        $('#createTime').html(Tools.getTime(e.CreatedAt));
        $('body').removeClass('body-load');
        // loadTWFC();
    })
}



// 加载twitter 和 facebook 的嵌入页面
var loadTWFC = function(){
    var fn, i, iframe, len, ref;

    ref = document.querySelectorAll('iframe[twitterid]');
    fn = function(iframe){
        var twitter;twitter = document.createElement('a');
        twitter.setAttribute('href', iframe.getAttribute('twitterid'));
        return iframe.parentNode.appendChild(twitter);
    };
    for (i = 0, len = ref.length; i < len; i++) {
        iframe = ref[i];fn(iframe);
    }
    widget=document.createElement('script');
    widget.setAttribute('src', '//platform.twitter.com/widgets.js');
    widget.setAttribute('charset', 'utf-8');
    widget.setAttribute('async', '');
    document.head.appendChild(widget)
}


var Labels = function (labels) {
    if(!labels || labels.length <= 0){
        return;
    }
    var $labels = $('#labelList');
    var html = [];
    for(var i=0,len=labels.length,k;i<len;i++){
        k = labels[i];
        html.push('<a href="javascript:;">'+k+'</a>');
    }
    $labels.css('display','block').html(html.join(''));

    var adObj = Local[window.lan]['adSearch'];
    var _link = adObj['link'].replace('{adSearchId}',Local['adSearchId']).replace('{adId}',adObj['adId']);

    $labels.on('click' ,'a' ,function(){
        var _v = $(this).text();
        window.location.href ='/search?key='+_v;
    })
}

