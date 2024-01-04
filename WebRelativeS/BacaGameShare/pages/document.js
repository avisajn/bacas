export const HtmlPage = ({ title, data, id, source, status,view, content }) => {
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
    <meta property="og:url" content="${'http://berita.community.baca.co.id/'+data.data.Id}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${data.data.Content}" />
    <meta property="og:image" content="${'https://img.cdn.community.baca.co.id/' + data.data.Images[0].ImageGuid}"/>
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
                <img src="https://wvb.baca.co.id/web-img/logo.png" class="logo-img" alt="">
            </div>
            <div class="content">
                <p class="top">Baca Plus</p>
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
        </div>
        <div class="video">
            <img src="https://wvb.baca.co.id/web-img/icon-video.png" class="video-content" alt="">
            <img src="https://wvb.baca.co.id/web-img/icon-video.png" class="play" alt="">
        </div>
        <div class="images">
            <img src="" alt="" class="images-item">
        </div>
        <div class="wrapper-bottom">
            <img class="bgc" src="https://wvb.baca.co.id/web-img/down.png" alt="">
            <div class="answer-btn">Buka Baca Plus untuk melihat konten</div>
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
        if (${status} == -5) {
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
                const date = new Date(datas.data.PublishTime * 1000)
                const Y = date.getFullYear()
                const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
                const D = date.getDate() + '/'
                var time = D + M + Y
                $('.time').html(time);
                if (datas.data.Type == 3) {
                   $(".video").css('display', 'initial');
                    $(".video-content").attr("src", datas.data.Videos[0].CoverUrl);
                    $('.article-content').html(datas.data.Content.substring(0, 200) + '...')
                }
                if (datas.data.Type == 1) {
                    $(".video").remove();
                    datas.data.Content == "" ? $('.article-content').html(datas.data.Content.substring(0, 400) + '...') : $('.article-content').html(datas.data.Title.substring(0, 400) + '...');
                }
                if (datas.data.Type == 2) {
                    $(".video").remove();
                    $('.article-content').html(datas.data.Content.substring(0, 400) + '...')
                    $(".images-item").attr("src", 'https://img.cdn.community.baca.co.id/' + datas.data.Images[0].ImageGuid);
                    if (datas.data.Images[0].ImageGuid == '') {
                        $(".images-item").attr("src", 'https://wvb.baca.co.id/web-img/im.png');
                    }
                }
                if (datas.data.Type == 4) {
                    $(".video").remove();
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
            setTimeout(function () {
                if (new Date().valueOf() - now > 400) return;
                window.location.href = 'https://app.appsflyer.com/com.jakarta.baca.lite?pid=communitywap&c=${source}';
            }, 200);
             window.location.href = 'baca://baca.co.id/link/com.jakata.baca.activity.GameHomeActivity?key_article_id_l=${id}&nipEventArgs=%7b%22event_name%22%3a%22game_community_out_link%22%2c%22utm_source%22%3a%22${source}%22%7d'
         } else {
            window.location.href = 'https://app.appsflyer.com/com.jakarta.baca.lite?pid=communitywap&c=${source}';
         }
    }
    </script>
</body>

</html>
  `;
};