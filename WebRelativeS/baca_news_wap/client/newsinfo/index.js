require("./index.scss");
require("../common/common.js");

// require("../util/mggScrollImg.js");

require('../common/img/share.png');
require('../common/img/facebook.png');
require('../common/img/line.png');
require('../common/img/whatsapp.png');
require('../common/img/icons2.png');

require('../common/img/ad-yn-320_250.jpg');
require('../common/img/ad-bx-320_250.jpg');
require('../common/img/ad-me-320_250.jpg');


require('../common/img/img_err_bx.png');
require('../common/img/img_err_yn.png');
require('../common/img/img_err_me.png');

require('../common/layer.scss');
var Layer = require('../common/layer.js');

var Api = require('../util/api.js');
var Local = require('../util/local.js');
var Store = require('../util/store.js');
const PhotoSwipe = require('photoswipe');
const PhotoSwipeUI_Default = require('./photoswipe_ui.js');

document.body.scrollTop = 0;
var CountryLan = Local[window.lan]['language'];
$('#relList').removeClass('hide');

if(window.newsType == '2'){
    $('.newsInfoBody').addClass('newsInfo-altas');
}

// 用JS解决一下本地化的问题
$('[localCountry]').each(function(){
    const $this = $(this);
    const _key = $this.attr('localCountry');
    if(_key && CountryLan[_key]){ 
        $this.text(CountryLan[_key]);
    }
})

var thumbImgUrl = Local[window.lan]['imgHost']; //缩略图：
// var thumbImgUrl = Country['imgHost']+'{`url`}_thumbnail'; //缩略图：

// if(window.lan == 'bx'){
//     var ab_adcontent = Store.getSession('detail-adcontent');
//     if(typeof(ab_adcontent) == 'undefined' || ab_adcontent == null){
//         // 广告流显示300*250的广告
//         if(Math.random() >= 0.5){ // 50%的概率，显示300*250的广告
//             ab_adcontent = true;
//         }else{
//             ab_adcontent = false;
//         }
//         Store.setSession('detail-adcontent' ,ab_adcontent);
//     }
//     if(ab_adcontent){
//         $('#adContentList').removeClass('hide').append('<script> (adsbygoogle = window.adsbygoogle || []).push({}); </script>');
//     }else{
//         $('#relList').removeClass('hide');
//     }
// }else{
//     $('#relList').removeClass('hide');
// }


// 添加评论 和浏览数 的 abtest
// var ab_cm_pv = Tools.getQuery('ab')
// if(ab_cm_pv){
//     setTimeout(function(){
//         window.ga('abtest.send', 'event', 'list', 'toInfo', 'use', ab_cm_pv);
//     },1000);
// }


if(window.newsType == '2'){ // 等于2的时候，加载轮训图片
    $(function () {
        var items = window.atlasData;
        const $info = $('#infoText');
        $('#infoTitle').html(window.newTitle);
        // console.log(items);
        const newArr = [];
        const contentObj = {};
        for(var i =0,len=items.length,_temp;i<len;i++){
            _temp = items[i];
            contentObj['_'+i] = _temp.Description;
            newArr.push({
                // src : thumbImgUrl+_temp.ImageGuid+'_thumbnail',
                src : thumbImgUrl+_temp.ImageGuid,
                // src : 'http://tse1.mm.bing.net/th?id=OIP.AFjql8FFByXqu0TyfGfc0AEfDZ&pid=15.1',
                // w : 287 ,
                // h : 217,
                w : _temp.Width,
                h : _temp.Height,
            });
        }
        $info.html(contentObj['_0']);
        var pswpElement = document.querySelectorAll('.pswp')[0];


        var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, newArr,  {
            index: 0, // start at first slide
            history: false,
            focus: false,
            shareEl: false,
            closeEl : false,
            arrowEl :false,
            tapToClose : false,
            tapToToggleControls : false,
            clickToCloseNonZoomable : false,
            closeElClasses: ['aaaa'], 

            showAnimationDuration: 0,
            hideAnimationDuration: 0 ,
            pinchToClose : false,
            closeOnScroll : false,
            closeOnVerticalDrag : false,
        });
        gallery.init();
        // After slides change
        // (after content changed)
        gallery.listen('afterChange', function() { 
            const current = gallery.getCurrentIndex();
            // console.log('afterChange ,current:' ,current ,contentObj['_'+current]);
            $info.html(contentObj['_'+current]);
        });
        gallery.framework.bind( gallery.scrollWrap /* bind on any element of gallery */, 'pswpTap', function(e) {
            const className = e.target.className;
            if(className == 'pswp__zoom-wrap' || className == 'pswp__item'){
                return window.history.go(-1);
            }
        });
    })
}else{
    $(function () {
        $('.body-placeholder').css({'opacity':0 ,'display':"none"});
        document.body.scrollTop = 0;
        $('#createTime').html(Tools.getTime(window.CreatedTime));
        setTimeout(function(){
            Labels();
        },100);

        const mainWidth = parseInt($('#newsInfo').width())-20;// 100
        // 判断视频的高度
        const $video = $('#videoFrame');
        if($video.attr('_height') && $video.attr('_width')){
            const _sh = $video.attr('_height'); // 500
            const _sw = $video.attr('_width');  // 200
            var height = parseInt(mainWidth*_sh/_sw);
            $video.width(mainWidth).height(height>=720?720:height);
        }

        // 判断是否存在uolplayer视频的iframe，如果存在，则设置高度=实际宽度/1.77
        const $uolplayerFrame = $('iframe.uolplayer,.article-detail p iframe[allowfullscreen]');
        console.log('$uolplayerFrame:',$uolplayerFrame);
        if($uolplayerFrame.length > 0){
            var realHeight = parseInt(mainWidth/1.77);
            $uolplayerFrame.attr('height' ,realHeight).css('height',realHeight);
        }
    });
    setTimeout(function(){
        $('body').removeClass('body-load');
        loadTWFC();

        return;
        const domAd = document.getElementById('my-ad-slot');
        // const domAd = document.getElementById('adsbyinmobi');
        const $ad = $('#my-ad-slot');
        const $panelBlock = $('.container-block');
        const screenHeight = window.screen.height;
        // 最短间隔式5秒
        var isShow = false;
        const $scroll = $('.container-body');
        const adConfig = { 
            siteid : "3794e7e6950f41a290bf89461e9d454c", 
            // slot : 14, 
            slot : 10, 
            manual: true, 
            adtype: "int",
            onSuccess : function (ad ,div) {
                console.log('ad:',ad);
                setTimeout(function () {
                    // $ad.addClass('active').addClass('layui-m-anim-scale');
                },1000);
            },
            onError : function (code ,div) {
                if(code = "NFR") {
                    // Call the next Ad network to request for native ads or handle appropriately
                    // 关闭广告！
                    console.log('获取广告代码出错！关闭广告！');
                    // $ad.removeClass('active').removeClass('layui-m-anim-scale');
                }
            }
        }
        // setTimeout(function(){
        //     // window._inmobi.getNewAd(domAd ,adConfig);
        // },2000);
        // $scroll.scroll(function () {
            // const top = $scroll.scrollTop();
            // console.log('v:',top,cheight);
            // return;
            // if(top < ( ($panelBlock.height()-screenHeight)/3 ) || $ad.hasClass('active') || isShow) return;
            // isShow = true;
            // 先判断是否弹出，如果已经弹出，则return ，否则显示
            // window._inmobi.getNewAd(domAd ,adConfig);
            setTimeout(function(){
                console.log('Like:');
                window._inmobi.getNativeAd(domAd ,{
                    siteid:"3794e7e6950f41a290bf89461e9d454c",
                    // manual: true, 
                    // adtype: "int",
                    onSuccess:function(ad,div){
                        console.log('ad:',ad);
                        alert('调用成功！返回的ad对象是：',JSON.stringify(ad));
                        div.getElementsByTagName("img")[0].setAttribute("src",ad.icon.url);
                        div.getElementsByTagName("h3")[0].innerHTML=(ad.title);
                        div.onclick=ad.reportAndHandleAdClick;
                        div.getElementsByTagName("p")[0].innerHTML=(ad.description+"<br/>This is a sponsored ad");
                        div.style.display="";
                    },onError:function(code,div){
                        alert('获取广告失败！错误信息为:'+JSON.stringify(code));
                    }
                });
            },2000);

        // });
        
        // window._inmobi.addEventListener("close", function(event){
        //     console.log('广告被关闭！');
        //     $ad.removeClass('active').removeClass('layui-m-anim-scale');
        //     setTimeout(function () {
        //         isShow = false;
        //     },5000);
        // });
    },1000);
}
// window.onload = function() {
// }




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


window.ga('send', 'event', 'detail', 'click', Tools.getQuery('origin'), window.newsId);
window.readOriginal = function(url){
    window.ga('send', 'event', 'detail', 'readOriginal' ,window.newsId);
    window.open(url);
}

var ABTest = function(){
    adhoc.setFlagDef({'showShare':false})//设置试验变量默认值（网络异常或获取试验变量失败时使用）
    adhoc.init('ADHOC_f9c0ffb7-d21e-4297-b66d-0a451468211d',window.ClientId);//初始化
    adhoc.getExperimentFlags(function(flags){
        console.log('flog',flags.get('showShare'))
    });
}

// 评论
var Comment = (function(){
    // ABTest();
    if(window.CommentCount <= 0){
        return;
    }
    var _getHtml = function(e){
        var data = e.Comments;
        var list = e.ToDisplay;

        var html = [];
        for(var i=0,len=list.length;i<len;i++){
            html.push(_getItem(data[list[i]]));
        }
        return html.join('');
    },  
    _getItem = function(k){
        var html = [];
        html.push('<section key="'+k.CommentId+'">');
        html.push('    <a href="javascript:;" class="item-link clearfix ">');
        html.push('      <div class="img-left">');
        html.push('        <img src="'+k.AvatarUrl+'">');
        html.push('       </div>');
        html.push('      <div class="comment-info">');
        html.push('           <div class="info-tag clearfix">');
        html.push('           <span class="name"><b>'+k.UserName+'</b><br/>'+Tools.getTime(k.Timestamp)+'</span>');
        html.push('           <span class="numbers">'+k.Likes+'</span>');
        html.push('           <span class="upimg"></span>');
        html.push('       </div>');
        html.push('       <div class="comment">');
        html.push(k.Content);
        html.push('       </div>');
        html.push('      </div>');
        html.push('     </a>');
        html.push('</section>');
        return html.join('');
    }
    Api.getCommonList(window.newsId ,function(e){
        if(!e || e.ToDisplay <= 0) {return;}
        $('#commentList').html(_getHtml(e));
    });
}());

var Labels = function () {
    var labels = window.newLabels;

    // labels = 'Ayu Dewi, Felicya Angelista, Denny Cagur';

    if(!labels){ return; }
    if(labels.indexOf(',') > 0){
        labels = labels.split(',');
    }else{
        labels = [labels];
    }
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

// 赞或者踩
var Like = (function () {
    var status = false; // false代表没有赞或踩过，true代表已经赞或踩
    var nid = window.newsId;
    var $btnLikeTrue = $('#btnLikeTrue'),
        $btnLikeFalse = $('#btnLikeFalse'),
        $html = $('#likeShareHtml');

    var _layIndex = 0;
    // 从Store中得到赞或踩，这个应该保存在localstorage
    var localData = Store.get('like') || {};
    if(typeof(localData[nid]) != 'undefined'){
        status = true;
        var val = localData[nid];
        if(val){
            $btnLikeTrue.addClass('over');
        }else{
            $btnLikeFalse.addClass('over');
        }
        $btnLikeTrue.on('click' ,function () {
            _layIndex = layer.open({
                content: $html.html()
            });
        });
        return;
    }
    var submit = function (dom ,val) {
        dom.html('<span></span>'+(parseInt(dom.text())+1)).addClass('over');
        status = true;
        localData[nid] = val;
        Store.set('like' ,localData);
        Api.setLike(nid ,val);
        window.ga('send', 'event', 'detail', 'clickLike' ,val, nid);
    }
    $btnLikeTrue.on('click' ,function () {
        if(status) return;
        submit($(this) ,true);
        setTimeout(function () {
            //信息框
            _layIndex = layer.open({
                content: $html.html()
            });
        },200);
    });

    $btnLikeFalse.on('click' ,function () {
        if(status) return;
        submit($(this) ,false);
    });
    
    $html.find('.text').html(CountryLan['like-share']);
    
    $('body').on('click' ,'.like-share .close-share' ,function () {
        layer.close(_layIndex);
    })
}());


const defaultImg = '/common/img/img_err_'+window.lan+'.png'
// 使用默认的图片
$('#relList img').error(function () {
  $(this).attr('src', defaultImg).css('margin-top','-4%');
});

var toRedirect = function(){
    if(window.history.length <= 2){
        var pathname = window.location.pathname;
        var url = pathname + window.location.search;
        window.addEventListener("popstate",function(){
            if(pathname != '/'){
                window.location.href = '/';
            }
        });
        window.onpopstate = function(e){
            if(pathname != '/'){
                window.location.href = '/';
            }
        }
        window.history.pushState(null,"redirectOver",url);
    }
}




const isOpen = Tools.getQuery('open');

if(Store.getSession('notAllowOpenApp') || isOpen=='not' || window.location.origin.indexOf('azurewebsites') >= 0){
    console.log('不需要打开app ,当前语言为'+window.lan);
}else{  // 不存在，则需要打开app
    // 判断是否为移动端，如果是移动端才弹窗
    if(window.isMobile){
        var fapp = Tools.getQuery('frombaca'); // 在APP内打开的网页，不需要跳转到APP中
        if(typeof(fapp) != 'undefined' && fapp == '1'){
            console.log('从APP内打开的详情页，不需要打开APP');
        }else{ 
            console.log('打开app');
            window.Download.redirect('detail_promo' ,'1');
        }
    }
}

