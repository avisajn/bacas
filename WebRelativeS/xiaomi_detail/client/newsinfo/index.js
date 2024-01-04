require("./index.scss");
require("../common/common.js");

// require("../util/mggScrollImg.js");

require('../common/img/icons2.png');

require('../common/img/ad-yn-320_250.jpg');

require('../common/img/img_err_yn.png');
require('../common/font/MILT_RG.ttf');


require('../common/layer.scss');
var Layer = require('../common/layer.js');

var Api = require('../util/api.js');
var Local = require('../util/local.js');
var Store = require('../util/store.js');




document.body.scrollTop = 0;
var CountryLan = Local[window.lan]['language'];
$('#relList').removeClass('hide');

if(window.newsType == '2'){
    $('.newsInfoBody').addClass('newsInfo-altas');
}


var thumbImgUrl = Local[window.lan]['imgHost']+'api/v1/NewsImage/'; //缩略图：
$(function () {
    $('.body-placeholder').css({'opacity':0 ,'display':"none"});
    document.body.scrollTop = 0;
    $('#createTime').html(Tools.getTime(window.CreatedTime));
    
    // 判断视频的高度
    const $video = $('#videoFrame');
    if($video.attr('_height') && $video.attr('_width')){
        const _sh = $video.attr('_height'); // 500
        const _sw = $video.attr('_width');  // 200
        const mainWidth = $('#newsInfo').width();   // 100
        var height = parseInt(mainWidth*_sh/_sw);
        $video.width(mainWidth).height(height>=720?720:height);
    }

    // showAds();

})
setTimeout(function(){
    $('body').removeClass('body-load');
    loadTWFC();
},1000);
// window.onload = function() {
// }

const showAds = function(){
    const width = $('#relList').width();
    const height = parseInt(width / 1.2);
    const html = ['<iframe src="http://berita.baca.co.id/adview?w='+width+'&h='+height+'" style="width:'+width+'px;height:'+height+'px;" class="frame-ads"></iframe>'];
    setTimeout(function(){
        $('#adsPanel').append(html.join(''));
    },500);
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


// window.ga('send', 'event', 'detail', 'click', Tools.getQuery('origin'), window.newsId);



const defaultImg = '/common/img/img_err_'+window.lan+'.png'
// 使用默认的图片
$('#relList img').error(function () {
  // $(this).attr('src', defaultImg).css('margin-top','-4%');
});

