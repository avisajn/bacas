require('./css/common.less');
require('./css/index.less');
require('./lib/common/common.js');
const API = require('./lib/common/api.js');
const PT = require('./lib/pt.js');
const Ranking = require('./lib/ranking.js');
const Music = require('./lib/music.js');

const $name = $('#form_name');
const $phone = $('#form_phone');
const $city = $('#form_city');
$(function () {

    $('#pageLoading').addClass('hide');
    // 在这里判断是否从APP进入的
    const nipDevice = window.Tools.getQuery('nipDevice');
    if(nipDevice != 'android' && nipDevice != 'ios') {
        window.ModalTo('modal_download_panel');
        return;
    }
    // PT.start();
    //         window.ModalTo('modal_game_panel');        

    API.getUserInfo(function (e) {
        if(e.err || !e.name) return;
        $name.val(e.name);
        $phone.val(e.phone);
        $city.val(e.city);
    });

    $('body').click(function () {
        Music.init();
    });
    

    $('#btn_play').click(function () {
        // 验证手机号
        window.ga('send', 'event', 'page-index', 'click' ,'submit');
        // 手机号：10-14位 + 数字
        if(!$name.val()) return window.toast('Masukkan nama pengguna');
        var res = API.verifyPhone($phone.val());
        if(!res || res.err) return window.toast(res.err,{width:200});
        res = $phone.val();
        if(!res) return window.toast('Nomor ponsel ini tidak benar');
        if(!$city.val()) return window.toast('Alamat salah');
        $('#set_user').text($name.val());
        API.addUser(function(){
            console.log('上传完毕！');
        })
        window.ModalTo('modal_rule_panel');

    });

    $('#btn_skip').click(function(){
        setTimeout(function () {
            PT.start();
            window.ModalTo('modal_game_panel');        
        },100);
    });

    // Star.show(80);

    $('#btn_show_ranking').click(function () {
        Ranking.init();
        window.ga('send', 'event', 'page-ranking', 'show' ,'ranking');
        setTimeout(function () {
            window.ModalTo('modal_ranking_panel');
        },200);
    });

    $('#btn_show_gift').click(function () {
        window.ga('send', 'event', 'page-ranking', 'show' ,'gift');
        setTimeout(function () {
            window.ModalTo('modal_gift_panel');
        },200);
    });

    const $maskpanel = $('#my_pt_container');
    $('#show_preview').click(function(){
        window.ga('send', 'event', 'page-game', 'preview' ,'game-image');
        if($maskpanel.hasClass('show-mask')){
            $maskpanel.removeClass('show-mask');
        }else{
            $maskpanel.addClass('show-mask');
            
        }
    });

    $('#tip_music').click(function(){
        window.ga('send', 'event', 'page-game', 'close' ,'music');
        const $this = $(this);
        if($this.hasClass('music-pause')){
            $this.removeClass('music-pause');
            Music.play();
        }else{
            $this.addClass('music-pause');
            Music.pause();
        }
    });

    $('#close_preview_mask').click(function(){
        $maskpanel.removeClass('show-mask');
    });
    
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

