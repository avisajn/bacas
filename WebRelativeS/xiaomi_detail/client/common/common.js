delete(Object.prototype.document);
delete(Object.prototype.location);

var jsCookie = require('js-cookie');

if(window.lan == 'me'){ // 如果是中东，则取消从右到左
    $('body').attr('dir','ltr');
    $('.set-rtl').attr('dir' ,'rtl');
}


window.header = {
    'X-User-Id'     : window.userId,
    // 'X-Raw-User-Id' : 'f78abd91-4aef-48c0-9fb9-80f718ec86d3',
    'X-Resolution'  : document.body.clientWidth+'*'+document.body.clientHeight,
    'X-Dpi'         : js_getDPI(),
    'X-Device-Platform': 'Web',
    // 'X-Net-Type'    : '4G',
    // 'X-Google-AD-ID': 'ed033b00-a3d9-43d8-b752-fc24d2791d08',
    // 'X-Location'    : '0.0%2C0.0',
    // 'X-Os-Version'  : UAParser.os.version,
    // 'X-Os-Api'      : '16',
    // 'X-Device-Type' : UAParser.device.type,
    // 'X-Google-AD-Status'  : 'false',
    // 'X-Imsi'        : '310260000000000',
    // 'X-TimeZone'    : 'GMT%2B08%3A00',
    // 'X-Device-Platform'   : UAParser.device.model + '-' + UAParser.device.vendor,
    // 'X-Imei'        : '000000000000000',
    // 'X-Update-Version-code' : '0',
    'X-APP-VERSION' : '30030',
    'X-App-Name'    : 'Baca-Wap',
    // 'X-Secret'      : '4f67d25c403850a1ba7b3099526e67cf'
}
function js_getDPI() {
    var arrDPI = new Array();
    var dpi = null;
    if (window.screen.deviceXDPI != undefined) {
        dpi = window.screen.deviceXDPI;
    }
    else {
        var tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        dpi = parseInt(tmpNode.offsetWidth);
        tmpNode.parentNode.removeChild(tmpNode);    
    }
    return dpi;
}
jsCookie.set('hp' ,JSON.stringify(window.header));
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
require('./img/logo-me.png');
require('./img/loading.gif');


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

window.Tools = global.Tools = {
    getQuery : function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    },
    getTime : function(strDate){
        var date = new Date(strDate);
        return date.Format("dd/MM hh:mm");
    }
}

