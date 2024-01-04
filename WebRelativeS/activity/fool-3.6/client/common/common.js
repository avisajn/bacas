delete(Object.prototype.document);
delete(Object.prototype.location);


// 兼容性:assign未定义的问题;出现在低版本手机自带的浏览器上
if (typeof Object.assign != 'function') { (function() {
        Object.assign = function(target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var output = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source !== undefined && source !== null) {
                    for (var nextKey in source) {
                        if (source.hasOwnProperty(nextKey)) {
                            output[nextKey] = source[nextKey];
                        }
                    }
                }
            }
            return output;
        };
    })();
}

require('./img/logo.png');
require('./img/logo-min.png');
require('./img/logo-bx.png');

require('./img/share-title-bx.png');
require('./img/share-title-yn.png');
require('./img/hand.png');

require('./img/loading.gif');
require('./img/arrow-android.png');
require('./img/arrow-ios.png');


global.myLazyload = require('lazyloadjs')();

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt){
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

var ua = navigator.userAgent.toLowerCase();
if (/iphone|ipad|ipod/.test(ua)) {
    window.Platform = 'ios';
}else if (/android/.test(ua)) {
    window.Platform = 'android';
}else{
    window.Platform = 'pc';
}




window.Tools = global.Tools = {
    getQuery : function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    },
    getTime : function(strDate){
        var date = new Date(strDate);
        return date.Format("dd/MM hh:mm");
    },
}


// 判断有没有from
const _from = window.Tools.getQuery('from');
if(_from){
    window.ga('send', 'event', window.page, 'channel', _from);
}

$('body').on('click', '.click-big' ,function(){
    var _this = $(this);
    _this.addClass('active');
    setTimeout(function(){
        _this.removeClass('active');
        setTimeout(function(){
            _this.trigger('clickover');
        },400);
    },100);
});


window.shareClick = {
    _domShareBlock : $('#shareBlock'),
    _layindex : 0,
    showShare : function(){
        var selfBlock = $('#sharePanelText');
        var $hand = $('.share-hand');
        var className = 'panel-arrow-hand';
        var $imgShareArrow = $('#imgShareArrow');
        var type = 'up';    // up down


        if(window.Platform == 'ios' || type == 'down'){
            className += ' panel-arrow-ios';
            $imgShareArrow.attr('src' ,'/common/img/arrow-ios.png');
        }else{
            className += ' panel-arrow-android';
            $imgShareArrow.attr('src' ,'/common/img/arrow-android.png');
        }

        window.ga('send', 'event', window.page, 'share-click', 'showModalTimes');

        if(typeof(layer) == 'undefined'){
            selfBlock.show();
            $hand.removeClass('hide');
        }else{
            //底部对话框
            this._layindex = layer.open({
                content: selfBlock.html()
                // ,skin: 'footer'
                ,className : className,
                shadeClose : true
            });
            setTimeout(function(){
                $hand.removeClass('hide');
            },100);
        }
    },
    hideShare : function(){
        $('.share-hand').addClass('hide');
        layer.close(this._layindex);
    },
    shareTo : function(type){
        var url = '';
        var hostUrl = window.hostUrl;
        var title = window.newTitle;
        if(type == 'facebook'){
            url = 'http://www.facebook.com/sharer/sharer.php?u='+hostUrl+'&t='+title;
        }else if(type == 'twitter'){
            url = 'https://twitter.com/share?url='+hostUrl+'&text='+title;
        }else if(type == 'whatsapp'){
            url = 'whatsapp://send?text='+title+' - '+hostUrl;
        }else if(type == 'line'){
            url = 'http://line.me/R/msg/text/?title%0D%0A'+hostUrl;
        }
        console.log('url:',url);

        window.ga('send', 'event', window.page, 'share', type);
        setTimeout(function(){
            window.open(url);
        },200);
    }
}

window.Download = {
    url : {
        android:{
            yn:{
                intro: 'http://m.onelink.me/2b9e81d9',
                list: 'http://m.onelink.me/e16dca1',
                detail: 'http://m.onelink.me/2293df71'
            },
            bx:{
                intro: 'http://m.onelink.me/26a987f9',
                list: 'http://m.onelink.me/ece9aaf5',
                detail: 'http://m.onelink.me/4bc14cf1'
            }    
        },
        ios : {
            bx : 'https://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8',
            yn : 'https://itunes.apple.com/us/app/baca-berita-video-dan-humor/id1180423098?l=zh&ls=1&mt=8'
        },
        ipalink : {
            yn : 'baca://',
            bx : 'cennoticias://',
        },
        applink : {
            yn : 'baca://baca.co.id/',
            bx : 'cennoticias://cennoticias.com/'
        },
        introlink : {
            yn : 'http://baca.co.id/intro',
            bx : 'http://cennoticias.com/intro'
        }
    },
    redirect : function(downloadType){//下载来自type=[引导页intro，列表页list，详情页detail]
        downloadType = 'detail';
        // 判断Android 还是 Ios
        var country = window.lan;
        var ua = navigator.userAgent.toLowerCase(); 
        var urlObj = this.url;
        if (/iphone|ipad|ipod/.test(ua)) {
            window.ga('send', 'event', downloadType, 'clickDownload', 'ios');
            var _url = urlObj['ipalink'][country];
            if(window.newsId){
                _url = _url + window.newsId;
            }
            var now = new Date().valueOf();
            setTimeout(function () {
                if (new Date().valueOf() - now > 2050) return;
                window.location = urlObj['ios'][country];
            }, 2000);
            window.location = _url;
        } else if (/android/.test(ua)) {
            window.ga('send', 'event', downloadType, 'clickDownload', 'android');
            // 否则打开a标签的href链接
            var now = new Date().valueOf();
            setTimeout(function () {
                if (new Date().valueOf() - now > 400) return;
                window.location.href = urlObj['android'][country][downloadType];
            }, 200);
            // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
            window.location.href = urlObj['applink'][country]+window.newsId;
        }else{ //PC端
            window.open(urlObj['android'][country]['intro']);
            window.ga('send', 'event', downloadType, 'clickDownload', 'other');       // 列表－下载：其它
        }
    },
    closeDown : function(downloadType){
        window.ga('send', 'event', downloadType, 'closeDownload');
        $('#appDownload').hide();
        if(downloadType == 'detail'){
            $('.container-body').css('marginTop', '0px');
            $('#newsInfo').css('paddingTop', '.6rem');
        }
    }
}

