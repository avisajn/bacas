require('./css/common.less');
require('./css/index.less');
require('./lib/common.js');
const API = require('./lib/api.js');
const dataHandle = require('./lib/dataHandle.js');
const comments = require('./lib/comment.js');
// const Dialog = require('./lib/dialog.js');
window.canScroll = true;
$(function () {
   
    
    if(window.Tools.getQuery('utm_source') == 'baca'){
        // $('#btn-down-hide').addClass('hide');
    }

    $('#pageLoading,#modal_article_detail').addClass('hide');
    // 实现分享吸附
    loadShareAdsorp();
    lazyLoad();
    dataHandle.init();
    comments.init();    

    $('[btn_share_to]').on('touchstart',function(e){
        e.stopPropagation();
        e.preventDefault();
        window.showShare($(this).attr('btn_share_to'));
    })
});




const lazyLoad = function(){
    const $lazys = $('[lazy-src]');
    var count = 0;
    var $dom = null;
    var _inter = setInterval(function(){
        if(count < $lazys.length){
           $dom = $lazys.eq(count);
           // console.log($dom.attr('lazy-src'));
           $dom.attr('src' ,$dom.attr('lazy-src'));
           count++;
        }else{
           clearInterval(_inter);
        }
    },150);
}
// 实现分享吸附
const loadShareAdsorp = function(){
	const $body = $('body');
    const $html = $('html');
	const $shareDrag = $('#share-drag');
	const domWidth = $shareDrag.width()+4;
	const domHeight = $shareDrag.height();
	var relaX = domWidth/2;
    var relaY = domHeight/2-60;
    //  窗口的宽度
    const client_height = document.body.clientHeight;
    const client_width = document.body.clientWidth;

    const half_client_width = client_width/2;
	$('#shareTouchMove').on('touchstart' ,function(ev){
    	const $this = $shareDrag;
    	$this.removeClass('ani');
    	const dom = $shareDrag[0];
        ev.preventDefault();
        ev.stopPropagation();
    	ev = ev.originalEvent.touches[0];
        var old_top = $html.scrollTop();
        // $body.addClass('container-fixed');
        $html.scrollTop(old_top);
    	const offset = $this.offset();

        // 获取当前鼠标位置，减去与div的相对位置得到当前div应该被拖拽的位置
        $body.bind('touchmove', function(e){
        	e = e.originalEvent.touches[0];
        	var left = e.clientX-relaX ;
        	var right = e.clientX-relaX + domWidth;
        	var top = e.clientY-relaY;
        	var bottom = e.clientY-relaY+domHeight;
        	var v_x = left;
        	var v_y = top;
        	if(left <= 0){
        		v_x = 0;
        	}else if(right >= client_width){
        		v_x = client_width-domWidth;
        	}

        	if(top <= 0){
        		v_y = 0;
        	}else if(bottom >= client_height){
        		v_y = client_height-domHeight;
        	}

        	dom.style.left = v_x+'px';
        	dom.style.top = v_y+'px';
        });
    })
    $body.bind('touchend' , function(){
		document.onmousemove = null;
		document.onmouseup = null;
		$body.removeClass('container-fixed');
		$body.unbind('touchmove');
		$shareDrag.addClass('ani');
		var left = parseInt($shareDrag.css('left'))+relaX;
		if(left >= half_client_width){
			left = client_width - domWidth;
		}else{
			left = 0;
		}
		$shareDrag.css('left' ,left);
    });
}
require('file?name=/top.static/sprite.png!./img/sprite.png');
