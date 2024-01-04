module.export = ({  title, data, shareUrl, id, source, status, view, img, content }) => {
    return `
    <!DOCTYPE html>
    <html lang="zh-CN">

    <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    <meta name="keywords" content="${title}">
    <meta name="description" content="${data.data.Content}">
    <meta name="robots" content="all">
    <meta name="baiduspider" content="all">
    <meta name="googlebot" content="all">
    <link rel="stylesheet" type="text/css" href="/css/${view}.css">

    <!-- 分享到facebook的meta -->
    <meta property="og:url" content="${shareUrl+data.data.Id}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${data.data.Content}" />
    <meta property="og:image" content="${'https://img.cdn.community.baca.co.id/'}${img}"/>
    <meta property="og:image:type" content="image/jpeg">


    <link rel="icon" type="image/x-icon" href="https://wvb.baca.co.id/web-img/icon.png" />
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.js"></script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-35158941-22"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-35158941-22');
    </script>

</head>

<body>
    <div class="wrapper" onclick="redirect()">
        <header class="header">
            <div class="logo">
                <img src="" class="logo-img" alt="">
            </div>
            <div class="content">
                <p class="top top-name">Baca Plus</p>
                <p class="item">Komunitas game pilihan anak muda!</p>
            </div>
            <div class="openbtn answer-btn">
                <div class="text-open">open</div>
            </div>
        </header>
        <div class="article">
            <div class="logo">
                <img src="https://wvb.baca.co.id/web-img/avatar.png" class="author-pic" alt="">
            </div>
            <div class="content">
                <p class="name top">Netizen +62</p>
                <p class="time"></p>
            </div>
            <div class="more">
                <img src="https://wvb.baca.co.id/web-img/more.png" alt="">
            </div>
        </div>
        <div class="article-list">
            <div class="article-content"></div>
            <iframe class="rich-text"  src="" frameborder="0"></iframe>
        <div class="video">
          <div style="position: relative; font-size: 0;" id="changeVideo">
            <img src="https://wvb.baca.co.id/web-img/icon-video.png" class="video-content" alt="">
            <img src="https://wvb.baca.co.id/web-img/icon-video.png" class="play" alt="" style="display:none">
          </div>

        </div>
        <div class="images">
            <img src="" alt="" class="images-item">
        </div>
        </div>
        <div class="wrapper-bottom">
            <div class="button">
                <div class="item-button">
                    <img class="icon_button icon_share" src="https://wvb.baca.co.id/web-img/icon_share.png">
                    <div class="count ShareCount"></div>
                </div>
                <div class="item-button icon_comment">
                    <img class="icon_button" src="https://wvb.baca.co.id/web-img/icon_comment.png">
                    <div class="count CommentCount"></div>
                </div>
                <div class="item-button icon_like">
                    <img style="margin-right: .1rem;" class="icon_button" src="https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/icon_up_def.png">
                    <div style="margin-right: .1rem; color:#FF4808;" class="count LikeCount"></div>
                    <img class="icon_button" src="https://wvb.baca.co.id/web-img/icon_down_def.png">
                </div>
            </div>
            <img class="bgc" src="https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/down.png" alt="">
            <div class="answer-btn bottom-button"></div>
        </div>
    </div>
    <div class="error" style="display:none">
        <p class="error-title">404</p>
        <p>Halaman yang kamu cari telah dihapus.</p>
    </div>
    <script>
    (function() {
        var docEl = document.documentElement,
            docBody = document.body,
            baseFontSize = 100,
            pageMaxWidth = 750,
            rootHtml = document.getElementsByTagName('html')[0],
            resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
            recalc = function() {
                var clientWidth = Math.min(
                    docEl.clientWidth || docBody.clientWidth,
                    window.innerWidth,
                    pageMaxWidth
                );
                var resFont = baseFontSize * (clientWidth / pageMaxWidth);
                rootHtml.style.fontSize = resFont + 'px';
            };
        if (!window.addEventListener) return;
        window.addEventListener(resizeEvt, recalc, false);
        recalc();
    })();

    $(function() {


        if (${status} == -5 || ${status} == -1 || ${status} == -6) {
            document.getElementsByClassName('wrapper')[0].style.display = 'none'
            document.getElementsByClassName('error')[0].style.display = 'block'
            document.getElementsByTagName('body')[0].style.backgroundColor = '#f7f8fb'
        }


        let id = location.href.substring(location.href.lastIndexOf('/'));
            $.ajax({
            type: "GET",
            url: "http://api.community.baca.co.id/v1/articles/" + ${id},
            data: '',
            dataType: "json",
            success: function(datas) {
                console.log(datas)
                const date = new Date(datas.data.PublishTime * 1000)
                const Y = date.getFullYear()
                const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
                const D = date.getDate() + '/'
                var time = D + M + Y
                $('.time').html(time);
                $('.ShareCount').html(datas.data.ShareCount)
                $('.CommentCount').html(datas.data.CommentCount)
                $('.LikeCount').html(datas.data.LikeCount)

                if (datas.data.Type == 3) {
                    if (datas.data.Videos[0].Height >datas.data.Videos[0].Width ) {
                        $("#changeVideo").css('width', '4rem');
                    }
                    $(".video").css('display', 'initial');
                    $(".rich-text").css("display", 'none');
                    $(".video-content").attr("src", datas.data.Videos[0].CoverUrl);
                    $('.article-content').html(datas.data.Content.substring(0, 200) + '...')
                    setTimeout(() => {  $(".play").css('display', 'initial'); }, 800);
                }
                if (datas.data.Type == 1) {
                    $(".video").remove();
                    $(".rich-text").attr("src", datas.data.Url);
                }
                if (datas.data.Type == 2) {
                    $(".video").remove();
                    $(".rich-text").css("display", 'none');
                    $('.article-content').html(datas.data.Content)
                    $(".images-item").attr("src", 'https://img.cdn.community.baca.co.id/' + datas.data.Images[0].ImageGuid);
                    if (datas.data.Images[0].ImageGuid == '') {
                        $(".images-item").attr("src", 'https://wvb.baca.co.id/web-img/im.png');
                    }
                }
                if (datas.data.Type == 4) {
                    $(".video").remove();
                    $(".rich-text").css("display", 'none');
                    $('.article-content').html(datas.data.Content.substring(0, 400) + '...')
                }
                if (datas.data.User.hasOwnProperty('FaceUrl')) {
                    $(".author-pic").attr("src", datas.data.User.FaceUrl)
                }
                if (datas.data.User.hasOwnProperty('Name')) {
                   $('.name').html(datas.data.User.Name)
                }else {
                   $('.name').html('Netizen +62')
                }
            }
        });

        var host = document.location.hostname
        if (host.indexOf('skuy')> -1) {
            $(".logo-img").attr("src", 'https://wvb.baca.co.id/web-img/baca.png');
            $('.top-name').html('sKuy')
            $('.bottom-button').html('Buka sKuy untuk melihat konten')
        }else {
            $(".logo-img").attr("src", 'https://wvb.baca.co.id/web-img/logo.png');
            $('.top-name').html('Baca Plus')
            $('.bottom-button').html('Buka Baca Plus untuk melihat konten')
        }
    })

    function redirect() {
        gtag('event', 'click', {
            'event_category': 'Click_From_${source}',
            'event_label': 'Click_From_${source}' ,
            'event_callback': function() {
                console.log('YES')
            }
        });
        var ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            var _url = 'baca://';
            if(window.newsId){
                _url = _url + ${id};
            }
            var now = new Date().valueOf();
            setTimeout(function () {
                if (new Date().valueOf() - now > 3050) return;
                window.location ='https://itunes.apple.com/us/app/baca-berita-video-dan-humor/id1180423098?l=zh&ls=1&mt=8';
            }, 3000);
            window.location = _url;
        } else if (/android/.test(ua)) {
            var now = new Date().valueOf();
            //未安装 到gp下载baca或plus
            setTimeout(function () {
                if (new Date().valueOf() - now > 3500) return;
                var res  = ''
                res = '${source}' == 'bacaplus'? 'baca.lite':'baca'
                window.location.href = 'https://play.google.com/store/apps/details?id=com.jakarta.'+ res +'&referrer=pid=communitywap%26c%3D${source}'+'&utm_source=communitywap&utm_campaign=${source}';

            }, 2500);

            //android 已安装 唤起baca或bacaplus或skuy
            var openApp = 'baca://baca.co.id/link/com.jakata.baca.activity.GameHomeActivity?key_article_id_l=${id}&nipEventArgs=%7b%22event_name%22%3a%22game_community_out_link%22%2c%22utm_source%22%3a%22${source}%22%7d'
            var openSkuy = 'skuy://skuy.games/link/com.jakata.baca.activity.GameArticleDetailActivity?keyInfoId_l=${id}&nipEventArgs=%7b%22event_name%22%3a%22game_community_out_link%22%2c%22utm_source%22%3a%22${source}%22%7d'
            if ('${source}'=='bacaplus') {
              window.location.href = openApp
            } else if ('${source}'=='baca') {
              setTimeout(function () {
                window.location.href =openApp
              },100);
              window.location.href = openSkuy
            } else {
              setTimeout(function () {
                window.location.href =openApp
              }, 100);
              window.location.href =openSkuy
            }
         } else {
            //pc打开 跳转到gp下载baca/bacaplus
            var res  = ''
            res = '${source}' == 'bacaplus'? 'baca.lite':'baca'
            window.location.href = 'https://play.google.com/store/apps/details?id=com.jakarta.'+ res +'&referrer=pid%3Dcommunitywap%26c%3D${source}'+'&utm_source=communitywap&utm_campaign=${source}';
         }
    }
    </script>
</body>

</html>
  `;
};
