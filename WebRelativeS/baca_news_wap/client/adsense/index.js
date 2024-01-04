require("./index.scss");

console.log('window.adsrc:',window.adsrc);

require('../common/img/'+window.adsrc+'.jpg');

require('../common/img/hd_1.jpg');

$('#btnDownload').on('click' ,function () {

	// 判断Android 还是 Ios
    var country = window.lan;
    var ua = navigator.userAgent.toLowerCase(); 
    var urlObj = {
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
            bx : 'itms-apps://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8',
            yn : 'itms-apps://itunes.apple.com/us/app/central-das-noticias/id1180922740?mt=8'
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
    };
    if (/iphone|ipad|ipod/.test(ua)) {
        if(country == 'yn'){
            alert('Versi iOS tidak didukung!');
            return;
        }
        openIos(urlObj['ipalink'][country]+window.newsId ,function(e){
            if( e == true){ // 没有安装
                window.location = urlObj['ios'][country];
            }
        })
    } else if (/android/.test(ua)) {
        // 否则打开a标签的href链接
        var now = new Date().valueOf();
        setTimeout(function () {
            if (new Date().valueOf() - now > 400) return;
            window.location.href = urlObj['android'][country]['list'];
        }, 200);
        // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
        window.location.href = urlObj['applink'][country]+window.newsId;
    }else{ //PC端
        window.open(urlObj['android'][country]['intro']);
    }
})

function openIos(url, callback) {
    if (!url) {
        return;
    }
    var node = document.createElement('iframe');
    node.style.display = 'none';
    var body = document.body;
    var timer;
    var clear = function(evt, isTimeout) {
       (typeof callback==='function') &&  callback(isTimeout);
        window.removeEventListener('pagehide', hide, true);
        window.removeEventListener('pageshow', hide, true);
        if (!node) {
            return;
        }

        node.onload = null;
        body.removeChild(node);
        node = null;

    };
    var hide = function(e){
        clearTimeout(timer);
        clear(e, false);
    };
    window.addEventListener('pagehide', hide, true);
    window.addEventListener('pageshow', hide, true);
    node.onload = clear;
    node.src = url;
    body.appendChild(node);
    var now = +new Date();
    //如果事件失败，则1秒设置为空
    timer = setTimeout(function(){
        timer = setTimeout(function(){
          var newTime = +new Date();
          if(now-newTime>1300){
            clear(null, false);
          }else{
            clear(null, true);
          }

        }, 1200);
    }, 60);
}