var attachFastClick = require('fastclick');
attachFastClick.attach(document.body);


var ua = navigator.userAgent.toLowerCase();
if (/iphone|ipad|ipod/.test(ua)) {
    window.Platform = 'ios';
}else if (/android/.test(ua)) {
    window.Platform = 'android';
}else{
    window.Platform = 'pc';
}




window.Tools = {
    getQuery : function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    },

    random:function(min,max){
        return Math.floor(min+Math.random()*(max-min));
    }
}

// 禁止放大缩小
document.addEventListener('touchstart',function (event) { 
    if(event.touches.length>1){ 
        event.preventDefault(); 
    } 
});

var lastTouchEnd=0; 
document.addEventListener('touchend',function (event) { 
    var now=(new Date()).getTime(); 
    if(now-lastTouchEnd<=300){ 
        event.preventDefault(); 
    } 
    lastTouchEnd=now; 
},false) 


const $body = $('html');
window.ModalTo = function (id ,callback) {
    callback = callback || function(){};
    const $dom = $('#'+id);
    $dom.siblings('[id^=modal_]').addClass('hide');
    $dom.removeClass('hide').css('opacity',0);
    const $content = $dom.find('.modal-body');
    if($dom.hasClass('modal-page')){
        $body.addClass('container-hidden');
        $dom.css('opacity',1);
        $content.addClass('layui-m-anim-scale')
        setTimeout(callback,10);
    }else{
        // $body.addClass('container-fixed');
        // window.scrollHanlder.disableScroll();
        var offset_margin = $content.attr('_offset_margin');
        if(!offset_margin){
            setTimeout(function(){
                offset_margin = parseInt($content.height()/2);
                $content.attr('_offset_margin' ,offset_margin);
                $dom.css('opacity',1);
                // $content.css('margin-top' ,'-'+offset_margin+'px');
                $content.addClass('layui-m-anim-scale');
                setTimeout(callback,10);
            },200);
        }else{
            $dom.css('opacity',1);
            // $content.css('margin-top' ,'-'+offset_margin+'px');
            $content.addClass('layui-m-anim-scale')
            setTimeout(callback,10);
        }
    }
}

function setScroll(){
    var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }
    var oldonwheel, oldonmousewheel1, oldonmousewheel2, oldontouchmove, oldonkeydown
    , isDisabled;
    function disableScroll() {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        oldonwheel = window.onwheel;
        window.onwheel = preventDefault; // modern standard

        oldonmousewheel1 = window.onmousewheel;
        window.onmousewheel = preventDefault; // older browsers, IE
        oldonmousewheel2 = document.onmousewheel;
        document.onmousewheel = preventDefault; // older browsers, IE

        oldontouchmove = window.ontouchmove;
        window.ontouchmove = preventDefault; // mobile

        oldonkeydown = document.onkeydown;
        document.onkeydown = preventDefaultForScrollKeys;
        isDisabled = true;
    }

    function enableScroll() {
        if (!isDisabled) return;
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);

        window.onwheel = oldonwheel; // modern standard

        window.onmousewheel = oldonmousewheel1; // older browsers, IE
        document.onmousewheel = oldonmousewheel2; // older browsers, IE

        window.ontouchmove = oldontouchmove; // mobile

        document.onkeydown = oldonkeydown;
        isDisabled = false;
    }
    window.scrollHanlder = {
        disableScroll: disableScroll,
        enableScroll: enableScroll
    };
}
function mobilecheck() {
    var check = false;
    (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}
window.isMobile = mobilecheck();

$(function(){
    const $btn = $('.btn');
    setScroll();
    if(window.isMobile){
        var move = null;
        $btn.on('touchend touchstart touchmove',function(e){
            if(e.type==='touchstart'){
                $(this).addClass('btn-active');
                move= null;
            }else if(e.type==='touchmove'){
                if(move) return;
                move= true;
            }else{
                $(this).removeClass('btn-active');
            }
        });
    }else{
        $btn.mousedown(function(){
            const $this = $(this);
            if($this.hasClass('btn-active')) return;
            $this.addClass('btn-active');
        });

        $btn.mouseup(function(){
            const $this = $(this);
            if(!$this.hasClass('btn-active')) return;
            $this.removeClass('btn-active');
        });
        
    }
    const eventType = window.isMobile?'touchstart':'click';
    $('body').on(eventType, '.button--sonar' ,function(e){
        var _this = $(this);
        if(_this.attr('over') == 'yes') return;
        _this.addClass('button--sonar-active').attr('over' ,'yes');
        var $sonar = null;
        if(_this.find('.button--sonar-div').length > 0 ){
            $sonar = _this.find('.button--sonar-div');
        }else{
            $sonar = $('<div class="button--sonar-div"><div></div></div>');
            _this.append($sonar);
        }
        const offset = _this.offset();
        console.log('offset:',offset);
        const y = offset.top;
        const x = offset.left;
        var tx = null;
        var ty = null;
        if(isMobile){
            const _touch = e.originalEvent.targetTouches[0];
            tx = _touch.clientX - x;
            ty = _touch.clientY - y;
        }else{
            tx = e.clientX - x;
            ty = e.clientY - y;
        }
        $sonar.css({top:ty ,left:tx});

        setTimeout(function(){
            _this.removeClass('button--sonar-active').attr('over','');
        },500);
    });

    // modal 的关闭
    $('.modal-body').on(eventType ,'.close' ,function () {
        const $parent = $(this).parent('.modal-body');
        $parent.addClass('a-fadeoutT');
        setTimeout(function () {
            $parent.removeClass('a-fadeoutT');
            // $body.removeClass('container-fixed').removeClass('container-hidden');
            $parent.parent('.modal').addClass('hide');
            // window.scrollHanlder.enableScroll();
        },500);
    });
    // 点击遮罩层关闭
    $('.modal').on(eventType ,'.mask-close' ,function () {
        const $parent = $(this).next('.modal-body');
        $parent.addClass('a-fadeoutT');
        setTimeout(function () {
            $parent.removeClass('a-fadeoutT');
            $body.removeClass('container-fixed').removeClass('container-hidden');
            $parent.parent('.modal').addClass('hide');
        },500);
    });
    $body.removeClass('loading');
});


window.Download = {
    url : {
        android:{
            yn:{
                intro: 'http://m.onelink.me/2b9e81d9',
                list: 'http://m.onelink.me/e16dca1',
                detail: 'http://m.onelink.me/5f3477de'
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
            yn : 'http://ba1ca.co.id/intro',
            bx : 'http://cennoticias.com/intro'
        }
    },
    redirect : function(downloadType){//下载来自type=[引导页intro，列表页list，详情页detail]
        downloadType = 'detail';
        // 判断Android 还是 Ios
        var country = 'yn';
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
                // console.log(urlObj['android'][country][downloadType]);
                window.location.href = urlObj['android'][country][downloadType];
            }, 200);
            // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
            window.location.href = urlObj['applink'][country]+window.newsId;
        }else{ //PC端
            window.open(urlObj['android'][country]['intro']);
            window.ga('send', 'event', downloadType, 'clickDownload', 'other');       // 列表－下载：其它
        }
    }
}
window.SEOData = {
    title : 'Baca - 10 Berita Terpanas Versi Si Baca',
    description : 'Kumpulan berita terpanas di 2017 penasaran, cek sekarang juga!  ',
    url : 'http://event.baca.co.id/top.html',
    image : 'http://img.cdn.baca.co.id/event/top10/img/share-title.jpg',
    // image : 'http://event.baca.co.id/survival_pub/share-img.jpg',
}
window.page = 'index';
// share
const shareTo = function(type){
    type = type || 'facebook';
    var url = '';
    var hostUrl = window.SEOData.url;
    const title = window.SEOData.title;
    if(type == 'facebook'){
        url = 'http://www.facebook.com/sharer/sharer.php?u='+hostUrl+'&t='+title;
    }else if(type == 'twitter'){
        url = 'https://twitter.com/share?url='+hostUrl+'&text='+title;
    }else if(type == 'whatsapp'){
        url = 'whatsapp://send?text='+title+' - '+hostUrl;
    }else if(type == 'line'){
        url = 'http://line.me/R/msg/text/?title%0D%0A'+hostUrl;
    }else

    window.ga('send', 'event', window.page, 'share', type);

    if(url){
        setTimeout(function(){
            window.location.href= url;
            // window.open(url);
        },200);
    }
}
window.showShare = function(type){
    type = type || 'facebook';
    const SEOData = window.SEOData;
    var hostUrl = window.SEOData.url;
    var nipDevice = window.Platform || 'android';
    if(nipDevice){
        if(nipDevice == 'android'){
            if(typeof(Android)!='undefined'){   // 新版
                window.ga('send', 'event', window.page, 'share', 'android-native');
                Android.openShareWindow(SEOData.title ,SEOData.description,hostUrl ,SEOData.image );
            }else{      // 旧版
                if(type == 'whatsapp'){
                    shareTo(type);
                }
            }
        }else if(nipDevice == 'ios' && typeof(window.webkit)!='undefined' && typeof(window.webkit.messageHandlers.webShare) != 'undefined'){
            window.ga('send', 'event', window.page, 'share', 'ios-native');
            const title = SEOData.title;
            window.webkit.messageHandlers.webShare.postMessage({body: {'title':title.replace(/Baca-/gi,''),'url':hostUrl }});
        }else{
            shareTo(type ,true);
        }
    }else{
        shareTo(type);
    }
}