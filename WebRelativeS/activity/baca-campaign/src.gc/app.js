require('./css/common.less');
require('./css/index.less');
require('./lib/common/common.js');
const API = require('./lib/common/api.js');
const Game = require('./lib/game.js');
const Ranking = require('./lib/ranking.js');
const Music = require('./lib/music.js');
const Mask = require('./lib/mask.js');
// const Vivus = require('vivus');

const $name = $('#form_name');
const $phone = $('#form_phone');
const $city = $('#form_city');
const $sex = $('#form_sex');


$(function () {

    $('#pageLoading').addClass('hide');

    loadShareAdsorp();

    API.getUserInfo(function (e) {
        if(e.err || !e.name) return;
        $name.val(e.name);
        $phone.val(e.phone);
        $city.val(e.city);
    });

    var is_over = false;
    Game.init(function(arr){
        Mask.calcByOrder(arr);
        Mask.show();
        setTimeout(function(){
            is_over = true;
        },2 * 1000);
    });

    $('#modal_game_panel').click(function(){
        if(!is_over) return;
        Mask.clear();
        Game.start();
        is_over = false;
    });



    $('#btnPlay').click(function(){
        // 验证手机号
        window.ga('send', 'event', 'page-index', 'click' ,'submit');
        if(!$sex.val()) return window.toast('Silahkan isi gender');
        window.sex = $sex.val();
        // 手机号：10-14位 + 数字
        if(!$name.val()) return window.toast('Masukkan nama pengguna');
        var res = API.verifyPhone($phone.val());
        if(!res || res.err) return window.toast(res.err,{width:250});
        res = $phone.val();
        if(!res) return window.toast('Nomor ponsel ini tidak benar');
        if(!$city.val()) return window.toast('Alamat salah');
        $('#set_user').text($name.val());
        API.addUser(function(){
            console.log('上传完毕！');
        })
        window.ModalTo('modal_game_panel' ,function(){
            Mask.clear();
            Game.start();
        });
    });

    // $('#btnPlay').click();

    $('[name="sex-choice"]').click(function(){
        if(this.checked){
            $sex.val($(this).attr('value'));
        }
    })

    $('#btnRePlay').click(function(){
        Mask.clear();
        Game.start();
    });

    $('#btnToInfo').click(function(){
        window.ModalTo('modal_rule_panel');
    });

    // $('#btn_play').click(function () {
    //     // 验证手机号
    //     window.ga('send', 'event', 'page-index', 'click' ,'submit');
    //     // 手机号：10-14位 + 数字
    //     if(!$name.val()) return window.toast('Masukkan nama pengguna');
    //     var res = API.verifyPhone($phone.val());
    //     if(!res || res.err) return window.toast(res.err,{width:200});
    //     res = $phone.val();
    //     if(!res) return window.toast('Nomor ponsel ini tidak benar');
    //     if(!$city.val()) return window.toast('Alamat salah');
    //     $('#set_user').text($name.val());
    //     API.addUser(function(){
    //         console.log('上传完毕！');
    //     })
    //     window.ModalTo('modal_rule_panel');

    // });

    // $('#btn_skip').click(function(){
    //     setTimeout(function () {
    //         PT.start();
    //         window.ModalTo('modal_game_panel');        
    //     },100);
    // });

    // // Star.show(80);

    // $('#btn_show_ranking').click(function () {
    //     Ranking.init();
    //     window.ga('send', 'event', 'page-ranking', 'show' ,'ranking');
    //     setTimeout(function () {
    //         window.ModalTo('modal_ranking_panel');
    //     },200);
    // });

    // $('#btn_show_gift').click(function () {
    //     window.ga('send', 'event', 'page-ranking', 'show' ,'gift');
    //     setTimeout(function () {
    //         window.ModalTo('modal_gift_panel');
    //     },200);
    // });
    $('body').click(function(){
        Music.play();
    });
    
    // $('#tip_music').click(function(){
    //     window.ga('send', 'event', 'page-game', 'close' ,'music');
    //     const $this = $(this);
    //     if($this.hasClass('music-pause')){
    //         $this.removeClass('music-pause');
    //         Music.play();
    //     }else{
    //         $this.addClass('music-pause');
    //         Music.pause();
    //     }
    // });

    // $('#close_preview_mask').click(function(){
    //     $maskpanel.removeClass('show-mask');
    // });
    
    // if(window.Tools.getQuery('utm_source') == 'baca'){
        // $('#btn-down-hide').addClass('hide');
    // }

    // $('#pageLoading,#modal_article_detail').addClass('hide');
    // // 实现分享吸附
    // loadShareAdsorp();
    // lazyLoad();
    // dataHandle.init();
    // comments.init();    

    // $('[btn_share_to]').on('touchstart',function(e){
    //     e.stopPropagation();
    //     e.preventDefault();
    //     window.showShare($(this).attr('btn_share_to'));
    // })
});

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