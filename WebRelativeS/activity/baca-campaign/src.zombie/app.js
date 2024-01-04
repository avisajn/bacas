require('./lib/common.js');
require('./lib/layer.js');
require('./lib/swiper.min.js');
require('./css/common.less');
require('./css/index.less');
require('./css/swiper.min.less');
const API = require('./lib/api.js');
const Music = require('./lib/music.js');
const Dialog = require('./lib/dialog.js');

$(document).on('touchstart', function() {
  Music.init();
})
var MySwiper = null;
var WxMessage = null;
const $pageIndex = $('#pageIndex');
// const music_background = document.getElementById("music_background");
$(function () {
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
        window.location.reload();
    }, false); 

    if(window.Tools.getQuery('utm_source') == 'baca'){
        $('#btn-down-hide').addClass('hide');
    }
    
    const $pageContainer = $('#pageContainer');
    const height = document.body.clientHeight;
    const width = document.body.clientWidth;

    if (width < height) {
        $pageContainer.css({
            width : height+'px',
            height : width+'px',
            top : (height - width) / 2 + 'px',
            left : 0 - (height - width) / 2 + 'px',
            transform : 'rotate(90deg)',
        });
        $('.paper-item').height(width*0.7);
    }else{
        $('.paper-item').height(height*0.7);
    }
    init();
});
var friend_name='';
const init = function(){
    const height = document.body.clientHeight;
    const width = document.body.clientWidth;
   // 判断是否为横屏
    MySwiper = new Swiper('#old_swiper', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        onlyExternal : true,
        autoplayStopOnLast:true,
        effect : 'fade',
        height : width > height ? height : width,
        direction : 'vertical',
        onInit: function(swiper){ //Swiper2.x的初始化是onFirstInit
            window.swiperAnimateCache(swiper); //隐藏动画元素 
            window.swiperAnimate(swiper); //初始化完成开始动画
        }, 
        onSlideChangeEnd: function(swiper){ 
            window.swiperAnimate(swiper); //每个slide切换结束时也运行当前slide动画
        }
    });
    // 如果index存在，则跳转到index的card里头
    window.nextPage = function (index) {
        // Music.play('switch_page');
        setTimeout(function(){
            if(index) MySwiper.slideTo(index-1);
            else MySwiper.slideNext();
        },50);
    }
    // 挂了的页面
    window.toDie = function(num){
        $('#dieWay'+num).removeClass('hide');
        Music.playDie(num);
    }
    Dialog.init();
    loadPlot();
    var tmpImg = new Image() ;
    tmpImg.src = 'http://event.baca.co.id/survival_pub/1-bg.jpg' ;
    tmpImg.onload = function() {
        $('#pageLoading').addClass('hide');
        Music.init();
    } ;
    window.returnFromDie = function(){
        Music.play('click');
        $('.die-way-panel').addClass('hide');
    }
    window.MySwiper = MySwiper; 
}


// 加载故事剧情的事件触发
function loadPlot(){
    $('#plot_btn_to_1').click(function(){
        friend_name = $('#input_friend_name').val();
        if(!friend_name){
            return;
        }
        Music.play('click');
        window.nextPage();
        $('#input_friend_name').addClass('hide');
        Dialog.reload([
            '<p>Kepalaku pusing….</p><p>Dimana aku?</p><p>Rasanya, ini seperti bukan kamarku.</p>' ,
            '<p>juga bukan di hotel. terlihat sangat asing…</p><p>Duh, pandanganku masih berkunang-kunang. Aku rasa aku harus keluar dari tempat ini.</p>',
        ] ,function(){
            window.nextPage();
        });
    });

    $('#redirect_to_start').click(function(){
        window.nextPage();
         setTimeout(function(){
            Dialog.reload([
                '<p>Dipenuhi rasa takut, kamu memantau seluruh ruangan. Kosong…</p><p>Hanya ada satu lemari besar, satu meja dan&nbsp;makanan di atasnya.</p>' ,
                '<p>Kamu merasa sangat lemas. Kamu merasa sangat lapar.</p><p>Saat kamu mau mengambil makanan tersebut, kamu melihat ada sebuah catatan kecil di sebelahnya.</p>',
                '<p>Kamu membaliknya, semua sisi penuh pesan yang berbeda.&nbsp;</p>'
            ] ,function(){
                window.nextPage();
            });
        },200);
    })
    // 加载有人物的场景
    const loadSceneFig = function(){
        console.log('loadSceneFig::');
        Dialog.reload([
            '<p>Perlahan – lahan terdengar suara anak kecil menangis. Tangisnya memilukan. Makin lama makin kencang dan menyesakkan. Saat kamu berjalan, kamu melihat ada anak kecil perempuan yang sedang menangis sambil jongkok. Dengan berhati-hati kamu mendekati anak kecil tersebut…..</p>' ,

            '<p>Kamu : Sedang apa kamu di sini ? dimana orang tua mu ?</p>',
            '<p>Anak kecil : Aku tidak tahu dimana orang tua ku berada, aku sangat takut sendirian disini.</p>',
            '<p>Kamu : baiklah mari ikut kakak.</p>',

            '<p>kemudian kamu dan anak kecil tersebut menemukan jalan keluarnya.</p><p>dan ada sebuah pintu di depan. Kamu membuka pintu itu, dengan harapan kamu bisa keluar dari rumah ini.</p>',
        ] ,function(){
            console.log('next::');
            // 问小女孩
            $controlHide.addClass('hide');
            $('#scene-2').removeClass('hide');
            Dialog.reload([
                '<p>Tiba - tiba dari balik pintu muncullah dua orang.</p><p>Ada seorang nenek yang terlihat baik, dan satunya lagi adalah teman kamu, '+friend_name+'.</p>',
            ] ,function(){
                $controlHide.addClass('hide');
                $('#dialog-friend').removeClass('hide');
                // 朋友说话
                Dialog.reload(['<p>Temanmu tersenyum dan mengungkapkan kegembiraannya bisa berada di sebelahmu.</p>' , ] ,function(){
                    // 老奶奶说话
                    $controlHide.addClass('hide');
                    $('#dialog-gmother').removeClass('hide');
                    Dialog.reload([
                        '<p>Kemudian sang nenek berbicara kepadamu:</p><p>Jangan percaya dengan temanmu, dialah tuan rumah di sini, dia akan mengirimkan zombie untuk membunuhmu!</p>' 
                        ,'<p>Percaya padaku, banyak orang yang sudah dimakan zombie karna tidak mendengarkanku. </p>' 
                    ] ,function(){
                        // 小女孩再次说话
                        $controlHide.addClass('hide');
                        $('#dialog-girl').removeClass('hide');
                        Dialog.reload(['<p>Dan anak kecil itupun berbisik : kak, jangan percaya dengan mereka berdua.. mereka bohong, aku takut.. ayo kak.. cepat.. cepat.. Cepattt!!</p>' ] ,function(){
                            // 跳转到选择页
                            $controlHide.addClass('hide');
                            $('#dialog-choice').removeClass('hide');
                        });
                    });
                });
            }); 
        });
    }
    const $controlHide = $('.control-hide');
    // 反面点击
    $('.paper-fm').click(function(){
        Music.play('click');
        window.nextPage();
        setTimeout(function(){
            Dialog.reload([
                '<p>Akhirnya kamu menemukan lemari tersebut.. dengan ketakutan.., bergetar.., kamu membuka lemari, dan berjalan masuk.. Di dalamnya gelap dan menyeramkan.</p>' 
            ] ,function(){
                window.nextPage();
                loadSceneFig();
            });
        },200);
    });

    

    $('#choice-gmother').click(function(){
        window.toDie(2);
        Dialog.reload([
            '<p>Ternyata si neneklah tuan rumah di sini. Dia lalu menyeretmu ke ruangan penuh zombie untuk dijadikan makanan.</p>' ,
            '<p>Hi Zombie, kalian dapat makanan enak lagi.</p><p>Matilah kamu!</p>',
            '<p>Baca berita: Berita tentang ciri-ciri teman sejati</p><p>klik dan lihat berita, untuk mendapatkan petunjuk</p>',
        ] ,function(){
            // 跳转到选择页
            $('#die-panel-return-2').removeClass('hide');
            // $controlHide.addClass('hide');
            // $('#dialog-choice').removeClass('hide');
        });
    });
    // 选择朋友
    $('#choice-friend').click(function(){
        Dialog.reload([
            '<p>Dengan persahabatan yang sangat kuat, kamu memilih temanmu. </p><p>Nenek dan anak kecil itupun tetap membujukmu, </p><p>Temanmu mengajakmu pergi secepatnya, tapi terlambat! </p>' ,
        ] ,function(){
            // 跳转到选择页
            $controlHide.addClass('hide');
            window.nextPage();
            Music.play('appear_zombie');
            Dialog.reload([
                '<p>si nenek itu tidak membiarkan kamu dan temanmu pergi begitu saja.Pasukan zombie mendadak muncul di belakang nenek dan bersiap menyerang kamu dan temanmu.</p>' ,
            ] ,function(){
                window.nextPage();
                Music.play('die_4');
                Dialog.reload([
                    '<p>Zombie-zombie ini berusaha untuk mencakar kalian, lalu kamu dan temanmu mundur perlahan – lahan dan mendekati sebuah kaca di belakang. Satu satunya cara untuk selamat adalah memecahkan kacanya dan melompat keluar. </p>' ,
                    '<p>Tetapi….. kalian sedang di tempat yang sangat tinggi, melompat keluar bisa saja langsung mati. Kalian pun melihat ke sekitar. Pada sisi kanan, ada sebuah pintu yang tertutup. Ada apakah dibalik pintu tersebut ? </p>'
                ] ,function(){
                    $('#choice-sence4-panel').removeClass('hide');

                });    
            });
        });
    });

    $('#choice-girl').click(function(){
        Dialog.reload([
            '<p>Ternyata anak kecil perempuan tersebut adalah zombie! Dia mengigit lehermu dan mencabik-cabik dagingmu!</p>',
        ] ,function(){
            // 跳转到选择页
            $('#die-panel-return-3').removeClass('hide');
        });
        window.toDie(3); 
    });

    $('#btn_to_die4').click(function(){
        window.toDie(4);
        Dialog.reload([
            '<p>Kamu dan teman kamu berlari ke arah pintu. Zombie-zombie mengejar di belakangmu. Sayangnya, di balik pintu ternyata ada banyak zombie yang juga sedang menunggu kamu. </p><p>Matilah kamu!</p>' ,
        ] ,function(){
            $('#die-panel-return-4').removeClass('hide');
        });
    });

    $('#btn_to_die1').click(function(){
        window.toDie(1);
        Dialog.reload([
            '<p>Kamu memakan makanannya dan kamu mati karena ada kandungan ikan Buntal beracun di makanan itu. </p>' ,
        ] ,function(){
            $('#die-panel-return-1').removeClass('hide');
        });
    });


    $('#btn_to_result_by_boat').click(function(){
        Music.play('click');
        window.nextPage();
        Dialog.reload([
            '<p>Kalian memecahkan kaca dan melompat keluar, jatuh ke laut. Kalian menemukan kayu dan berpegangan padanya. Akhirnya pun selamat dan tiba di suatu pulau. </p>' ,
        ] ,function(){
            window.nextPage();
            Dialog.reload([
                '<p>Kamu dan '+friend_name+' selamat karena kalian saling percaya. Jagalah selalu persahabatanmu. </p>' ,
                '<p>Jangan lupa gunakan aplikasi Baca untuk mudah cari berita terupdate. Download sekarang juga untuk menghindari zombie.Share dan tag ke teman yang kamu pilih. </p>' ,
            ] ,function(){
                // 弹出分享页
                console.log('弹出分享页');
            });
        });
    })

}