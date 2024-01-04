delete(Object.prototype.document);
delete(Object.prototype.location);

var jsCookie = require('js-cookie');
var Fingerprint = require('fingerprintjs');
var myfigerprint = new Fingerprint().get();
var Md5 = require("blueimp-md5");
var userId = Md5(myfigerprint);


var API = require('../util/api.js');
var Store = require('../util/store.js');

if (window.lan == 'me') { // 如果是中东，则取消从右到左
    $('body').attr('dir', 'ltr');
    $('.set-rtl').attr('dir', 'rtl');
}


window.header = {
    'X-User-Id': 'wap_' + userId,
    // 'X-Raw-User-Id' : 'f78abd91-4aef-48c0-9fb9-80f718ec86d3',
    'X-Resolution': document.body.clientWidth + '*' + document.body.clientHeight,
    'X-Dpi': js_getDPI(),
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
    'X-APP-VERSION': '30030',
    'X-App-Name': 'Baca-Wap',
    // 'X-Secret'      : '4f67d25c403850a1ba7b3099526e67cf'
}

function js_getDPI() {
    var arrDPI = new Array();
    var dpi = null;
    if (window.screen.deviceXDPI != undefined) {
        dpi = window.screen.deviceXDPI;
    } else {
        var tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        dpi = parseInt(tmpNode.offsetWidth);
        tmpNode.parentNode.removeChild(tmpNode);
    }
    return dpi;
}

window.onImgError = function(e) {
    const $this = $(e);
    const errorNum = parseInt($this.attr('error-num')) || 0;
    console.log('errorNum:', errorNum);
    if (errorNum == 1) {
        e.onerror = null;
        return;
    }
    $this.attr('error-num', (errorNum + 1));
    const oldSrc = $this.attr('old-src');
    e.src = oldSrc;
}

jsCookie.set('hp', JSON.stringify(window.header));
// 兼容性:assign未定义的问题;出现在低版本手机自带的浏览器上
if (typeof Object.assign != 'function') {
    (function() {
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
require('./img/logo-me.png');
require('./img/loading.gif');
require('./img/mipmap-xxxhdpi/logo.png');
require('./img/mipmap-xxxhdpi/coin.png');
require('./img/mipmap-xxxhdpi/close.png');
require('./img/mipmap-xhdpi/logo.png');
require('./img/mipmap-xhdpi/coin.png');
require('./img/mipmap-xhdpi/close.png');
require('./img/mipmap-xxhdpi/logo.png');
require('./img/mipmap-xxhdpi/coin.png');
require('./img/mipmap-xxhdpi/close.png');

function mobilecheck() {
    var check = false;
    (function(a) { if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
window.isMobile = mobilecheck();


global.myLazyload = require('lazyloadjs')();

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// if(window.lan == 'yn'){
// var showDate = {
//     '2017-03-31' : true,
//     '2017-04-01' : true,
// }
var fullPageDate = {
    '2017-03-31': true,
    '2017-04-01': true,
}

var today = (new Date()).Format("yyyy-MM-dd");
// today = '2017-03-31';
// if(showDate[today]){
//     var $info = $('#appDownload .firmname');
//     $info.html('Tanyakan rahasia selebriti <br/><span>Dapatkan <font style="color:yellow;">hadiah</font> menarik</span>');
// }

if (fullPageDate[today] && 1 == 2) {
    // require('./img/hd_fullpage_bx.gif');
    // require('./img/hd_fullpage_yn.gif');
    // function GetRandomNum(Min,Max) {
    //      var Range = Max - Min;   
    //      var Rand = Math.random();   
    //      return(Min + Math.round(Rand * Range));   
    // }
    // if(GetRandomNum(1,7) == 2){
    //     Store.setSession('hdscreen' ,false);
    // }
    // if(Store.getSession('hdscreen') != true){
    //     var url = 'http://event.baca.co.id/?from=wap';
    //     if(window.lan == 'bx'){
    //         url = 'http://event.cennoticias.com/?from=wap';
    //     }
    //     var html = [];
    //     html.push('<div style="position:fixed;top:0px;left:0px;right:0px;bottom:0px;background:#f4f5f6;z-index:9999999;text-align:center;">')
    //     html.push('<a href="'+url+'">');
    //     html.push('<span class="time" style="color:white;position:absolute;right:15px;top:15px;font-size:.5rem;">5</span>');
    //     html.push('<img src="/common/img/hd_fullpage_'+window.lan+'.gif" style="width:100%;height:100%;max-width:450px;"/>');
    //     html.push('</a>');
    //     html.push('</div>');
    //     var $dom = $(html.join(''));
    //     $('body').append($dom);
    //     var _time = 3;
    //     var _intTime = null;
    //     var $time = $dom.find('.time');
    //     var gameDjs = function(){
    //         if(_time >= 0){
    //             $time.text(_time);
    //             _time--;
    //         }else{
    //             Store.setSession('hdscreen' ,true);
    //             window.clearInterval(_intTime);
    //             $dom.remove();
    //         }
    //     }
    //     _intTime = setInterval(gameDjs ,1000);
    // }
} else {
    if (Store.get('firstscreen') != true) {
        $('#indexDownload').css({ 'opacity': 1, 'display': 'block' });
        Store.set('firstscreen', true, 60 * 60 * 24 * 2)
    }
}



// }
// if(Store.get('firstscreen') != true){
//     $('#indexDownload').css({'opacity' :1 ,'display':'block'});
//     Store.set('firstscreen' ,true ,60*60*24*2)
// }


window.Tools = global.Tools = {
    getQuery: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    getTime: function(strDate) {
        var date = new Date(strDate);
        return date.Format("dd/MM hh:mm");
    }
}

window.shareClick = {
    _domShareBlock: $('#shareBlock'),
    _layindex: 0,
    showShare: function(type) {
        var selfBlock = this._domShareBlock;
        if (typeof(window.page) == 'string') {
            window.ga('send', 'event', window.page, 'share-click', type, window.newsId);
        }
        if (typeof(layer) == 'undefined') {
            selfBlock.show();
        } else {
            //底部对话框
            this._layindex = layer.open({
                content: selfBlock.html(),
                skin: 'footer'
            });
        }
    },
    hideShare: function() {
        console.log(this._layindex);
        if (typeof(layer) == 'undefined') {
            this._domShareBlock.hide();
        } else {
            layer.close(this._layindex);
        }
    },
    shareTo: function(type) {
        var url = '';
        var hostUrl = window.hostUrl;
        var newsId = window.newsId;
        var title = window.newTitle;
        if (type == 'facebook') {
            url = 'http://www.facebook.com/sharer/sharer.php?u=' + hostUrl + newsId + '&t=' + title;
        } else if (type == 'twitter') {
            url = 'https://twitter.com/share?url=' + hostUrl + newsId + '&text=' + title;
        } else if (type == 'whatsapp') {
            url = 'whatsapp://send?text=' + title + ' - ' + hostUrl + newsId;
        } else if (type == 'line') {
            url = 'http://line.me/R/msg/text/?title%0D%0A' + hostUrl + newsId;
        }
        window.ga('send', 'event', window.page, 'share', type, newsId);
        API.logging.share(type, newsId);
        setTimeout(function() {
            window.open(url);
        }, 200);
    }
}

window.Download = {
    url: {
        // android:{
        //     yn:{
        //         intro: 'http://m.onelink.me/2b9e81d9',
        //         list: 'http://m.onelink.me/e16dca1',
        //         detail: 'http://m.onelink.me/2293df71'
        //     },
        //     bx:{
        //         intro: 'http://m.onelink.me/26a987f9',
        //         list: 'http://m.onelink.me/ece9aaf5',
        //         detail: 'http://m.onelink.me/4bc14cf1',

        //     },
        //     me : {
        //         intro: 'https://play.google.com/store/apps/details?id=com.nip.mena',
        //         list: 'https://play.google.com/store/apps/details?id=com.nip.mena',
        //         detail: 'https://play.google.com/store/apps/details?id=com.nip.mena'
        //     }    
        // },
        android: {
            yn: {
                intro: 'https://play.google.com/store/apps/details?id=com.jakarta.baca.lite&referrer=pid%3Dwap%26c%3Dintro&utm_source=wap&utm_campaign=intro',
                list: 'https://play.google.com/store/apps/details?id=com.jakarta.baca.lite&referrer=pid%3Dwap%26c%3Dlist&utm_source=wap&utm_campaign=list',
                detail: 'https://play.google.com/store/apps/details?id=com.jakarta.baca.lite&referrer=pid%3Dwap%26c%3Ddetail&utm_source=wap&utm_campaign=detail',
                detail_promo: 'https://play.google.com/store/apps/details?id=com.jakarta.baca.lite&referrer=pid%3Dwap%26c%3Ddetail_promo&utm_source=wap&utm_campaign=detail_promo',
                intro_baca: 'https://play.google.com/store/apps/details?id=com.jakarta.baca&referrer=pid%3Dwap%26c%3Dintro_baca&utm_source=wap&utm_campaign=intro_baca',
            },
            bx: {

                intro: 'https://play.google.com/store/apps/details?id=com.nip.cennoticias&referrer=pid%3Dwap%26c%3Dintro&utm_source=wap&utm_campaign=intro',
                list: 'https://play.google.com/store/apps/details?id=com.nip.cennoticias&referrer=pid%3Dwap%26c%3Dlist&utm_source=wap&utm_campaign=list',
                detail: 'https://play.google.com/store/apps/details?id=com.nip.cennoticias&referrer=pid%3Dwap%26c%3Ddetail&utm_source=wap&utm_campaign=detail',
                detail_promo: 'https://play.google.com/store/apps/details?id=com.nip.cennoticias&referrer=pid%3Dwap%26c%3Ddetail_promo&utm_source=wap&utm_campaign=detail_promo',
                intro_baca: 'https://play.google.com/store/apps/details?id=com.nip.cennoticias&referrer=pid%3Dwap%26c%3Dintro_baca&utm_source=wap&utm_campaign=intro_baca',
            },
        },

        ios: {
            // bx : 'itms-apps://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8',
            // yn : 'itms-apps://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8'
            me: 'https://itunes.apple.com/cn/app/%D8%B2%D9%88%D9%88%D9%85-%D8%A2%D8%AE%D8%B1-%D8%A7%D9%84%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1-%D8%AD%D9%88%D9%84-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A/id1247337771?l=en&mt=8',
            bx: 'https://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8',
            yn: 'https://itunes.apple.com/us/app/baca-berita-video-dan-humor/id1180423098?l=zh&ls=1&mt=8'
        },
        ipalink: {
            yn: 'baca://',
            bx: 'cennoticias://',
            me: 'mena://',
        },
        applink: {
            yn: 'baca://baca.co.id/',
            bx: 'cennoticias://cennoticias.com/',
            me: 'menanip://menanip.com/'
        },
        introlink: {
            yn: 'http://baca.co.id/intro',
            bx: 'http://cennoticias.com/intro',
            me: 'http://menanip.com/home/intro'
        }
    },
    redirect: function(downloadType, not_trigger) { //下载来自type=[引导页intro，列表页list，详情页detail]
        // 判断Android 还是 Ios
        var country = window.lan;
        var ua = navigator.userAgent.toLowerCase();
        var urlObj = this.url;
        var reg = new RegExp("(^|&)" + 'utm_source' + "=([^&]*)(&|$)", "i");
        var utm_source = window.location.search.substr(1).match(reg)
        if (!utm_source && typeof(utm_source) != 'undefined' && utm_source != 0) {
            utm_source = ''
        } else {
            utm_source = utm_source[2]
        }
        if (/iphone|ipad|ipod/.test(ua)) {
            // if(country == 'me'){
            //     alert('IOS رادصإ ريوطت يراج ');
            //     return;
            // }
            if (not_trigger != '1') {
                window.ga('send', 'event', downloadType, 'clickDownload', 'ios');
            }
            var _url = urlObj['ipalink'][country];
            if (window.newsId) {
                _url = _url + window.newsId;
            }
            var now = new Date().valueOf();
            setTimeout(function() {
                if (new Date().valueOf() - now > 3050) return;
                window.location = urlObj['ios'][country];
            }, 3000);
            window.location = _url;
        } else if (/android/.test(ua)) {
            if (not_trigger != '1') {
                window.ga('send', 'event', downloadType, 'clickDownload', 'android');
            }
            // 否则打开a标签的href链接
            var now = new Date().valueOf();
            setTimeout(function() {
                if (new Date().valueOf() - now > 400) return;
                window.location.href = utm_source == 'bacaplus' ? urlObj['android'][country][downloadType] : urlObj['android'][country]['intro_baca'];
            }, 200);
            // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
            window.location.href = urlObj['applink'][country] + window.newsId;
        } else { //PC端
            if (utm_source == 'baca' || utm_source == 'skuy') {
                window.open(urlObj['android'][country]['intro_baca']);
            } else {
                window.open(urlObj['android'][country]['intro']);
            }
            if (not_trigger != '1') {
                window.ga('send', 'event', downloadType, 'clickDownload', 'other'); // 列表－下载：其它
            }
        }
    },
    closeDown: function(downloadType) {
        window.ga('send', 'event', downloadType, 'closeDownload');
        $('#appDownload').hide();
        if (downloadType == 'detail') {
            $('.container-body').css('marginTop', '0px');
            $('#newsInfo').css('paddingTop', '.6rem');
        }
    },
    intoList: function() {
        window.ga('send', 'event', 'intro', 'intoSite');
        Store.set('firstscreen', true, 60 * 60 * 24 * 2);
        $('#indexDownload').hide();
    },
    intoSiteIntro: function() {
        if (window.ga) {
            window.ga('send', 'event', 'intro', 'intoSiteIntro');
        }
        window.open(this.url['introlink'][window.lan]);
    }
}


var $searchText = $('#searchText');
window.searchSubmit = function() {
    var v = $searchText.val();
    if (!v || !v.trim()) return;
    window.ga('send', 'event', 'search', 'key', v);
    $('#btnSearchSubmit').click();
}
// 回车的提交事件
window.serchKeySubmit = function() {
    var event = window.event || arguments.callee.caller.arguments[0];
    if (event.keyCode == 13) {
        window.searchSubmit();
    }
}

$(function() {
    var $hearbar = $('#topbar');
    var _width = $('html').width();
    // alert('_width'+JSON.stringify());
    // alert($('html').width());
    // $('.search-block,#searchText').width(_width-15-43);
    // $('.n-right').on('click' ,'.search' ,function () {
    // console.log('search');
    // window.location.href = '/search';
    // window.showSearch = true;
    // $hearbar.addClass('search-now');
    // })

    $('.logo').on('click', function() {
        window.showSearch = false;
        $hearbar.removeClass('search-now');
    })
})


// 加载谷歌广告搜索
;
(function() {
    var f = document.getElementById('cse-search-box');
    if (!f) {
        f = document.getElementById('searchbox_demo');
    }
    if (f && f['q']) {
        var q = f['q'];
        var n = navigator;
        var l = location;
        var du = function(n, v) {
            var u = document.createElement('input');
            u.name = n;
            u.value = v;
            u.type = 'hidden';
            f.appendChild(u);
            return u;
        };
        var su = function(n, t, v, l) {
            if (!encodeURIComponent || !decodeURIComponent) { return; }
            var regexp = new RegExp('(?:[?&]' + n + '=)([^&#]*)');
            var existing = regexp.exec(t);
            if (existing) {
                v = decodeURIComponent(existing[1]);
            }
            var delimIndex = v.indexOf('://');
            if (delimIndex >= 0) {
                v = v.substring(delimIndex + '://'.length, v.length);
            }
            var v_sub = v.substring(0, l);
            while (encodeURIComponent(v_sub).length > l) {
                v_sub = v_sub.substring(0, v_sub.length - 1);
            }
            du(n, v_sub);
        };
        var pl = function(he) {
            var ti = 0,
                tsi = 0,
                tk = 0,
                pt;
            return function() {
                var ct = (new Date).getTime();

                if (pt) {
                    var i = ct - pt;
                    ti += i;
                    tsi += i * i;
                }
                tk++;
                pt = ct;
                he.value = [ti, tsi, tk].join('j');
            };
        };
        var append = false;
        if (n.appName == 'Microsoft Internet Explorer') {
            var s = f.parentNode.childNodes;
            for (var i = 0; i < s.length; i++) {
                if (s[i].nodeName == 'SCRIPT' &&
                    s[i].attributes['src'] &&
                    s[i].attributes['src'].nodeValue == unescape('\x2F\x2Fcse.google.co.id\x2Fcoop\x2Fcse\x2Fbrand?form=cse-search-box\x26amp\x3Blang=in')) {
                    append = true;
                    break;
                }
            }
        } else {
            append = true;
        }
        if (append) {
            var loc = document.location.toString();
            var ref = document.referrer;
            su('siteurl', loc, loc, 250);
            su('ref', loc, ref, 750);

            if (q.addEventListener) {
                q.addEventListener('keyup', pl(du('ss', '')), false);
            } else if (q.attachEvent) {
                q.attachEvent('onkeyup', pl(du('ss', '')));
            }
        }


        if (n.platform == 'Win32') {
            // q.style.cssText = 'border: 1px solid #7e9db9; padding: 2px;';
        }


        if (window.history.navigationMode) {
            window.history.navigationMode = 'compatible';
        }
    }
})();