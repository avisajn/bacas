module.exports =  {
  // 公共的配置
  base : {
    // 接口的地址
    interfaceModel : {
      category  : '/category',
      newsInfo  : '/News/{?}',
      newsList  : '/News',
      comment   : '/Comment/{?}/Hot',
      like      : '/News/{id}/like/{yes}',
      search    : '/search',

      trendingCategory: '/category',
      trendingList    : '/News/Trendings',
      trendingInfo    : '/News/Trending/{?}'
    }
  },

  adClientId : 'ca-pub-9683444248981364',
  adSearchId : 'partner-pub-9683444248981364',

  // 巴西的配置
  bx : {
    webUrl : 'http://noticias.cennoticias.com/',  //访问巴西的基本地址
    interfaceUrl : 'http://api.cennoticias.com/api/v1', // 访问接口的地址
    trendingBase : 'http://api.cennoticias.com/api/v1',
    interfaceLog : 'http://logging.cennoticias.com/api/logging',
    imgHost : 'http://cennoticias.com/',
    adSearch : {
      adId : '7574213138',
      actionLink : 'http://www.google.com.br',
      link : 'http://www.google.com.br/cse?cx={adSearchId}:{adId}&ie=UTF-8&q={key}'
    },
    ad : {
      detail : '2190487538',
      newsfeed : '1936795531',
      newsfeed300250 : '3380052334',
      detailContent : '3511149934', // 详情页－内容广告
    },
    language : {
      'blueFreshMessage-num'  : 'novos',     // 列表页－刷新成功后－显示更新了几条的蓝色条
      'blueFreshMessage-null' : 'Não há mais novidades, tente mais tarde', // 列表页－刷新成功后－没有数据
      'blueFreshMessage-trending-num' : 'tópicos novos para você',  //列表页－刷新成功后－针对Trending
      'blueFreshMessage-trending-null' : 'Volte daqui a pouco, não há tópicos novos agora',  //列表页－刷新成功后－针对Trending
      
      'timeout' : 'Artikel tidak ditemukan. Kembali ke home dalam <span id="time">5</span> detik.',

      'pull-up'       : 'Solte para mais atualizações', // 松开刷新的提示
      'pull-down'     : 'Arraste para mais atualizações', // 下拉更新的提示
      'loading'       : 'Atualizando...', // 加载中的提示

      'search-place'  : 'Pesquise on que deseje',
      'like-share'    : 'Notícia curtida! <br/> Compartilhe nas suas redes', // 点赞成功后，弹出的是否要分享

      'download'              : 'Baixe agora!',                 //下载APP
      'firm'                  : 'Central das Notícias',           // 黑色提示，公司名称
      'firm-intro'            : 'Notícias, vídeos e humores',    //黑色提示，公司介绍
      'intoWebSite'           : 'Entre no site >',         // 进入页面
      'intoSite'      : 'Ir para a página principal',   // 进入官网

      'category-top'          : 'Categorias',                //选择类型页－上边的提示
      'category-show' : 'Minhas categorias',     //选择类型页－显示类别的提示信息
      'category-hide' : 'Recomendados', // 选择类型页－不现实类别的提示信息
      'share'         : 'Compar<br/>tilhar',    // 详情页，分享
      'shareClose'    : 'Cancelar',      // 详情页，分享关闭
      'relativeNews'  : 'Recomendados',  // 详情页，相关新闻
      'oldLink'       : 'Ver fontes',    // 详情页，跳转到原始页面
      'downloadBlock' : 'Baixe!' , // 详情页，下载块

      'comment'       : 'Comentários',   // 详情页，评论
      'enterApp'      : 'Entre no app',   // 详情页，进入APP

      'ga'            : 'UA-35158941-7',  // 统计ID
      'linkImg'       : 'http://cennoticias.com/', // 图片访问的链接

      '404-err'       : 'O contéudo não existe.',
      '404-intoSite'  : 'Página Principal',

      'webTitle'      : 'Central das Notícias – Notícias, vídeos, esportes e diversão',
      'webDescription': 'As melhores notícias, informações sobre esporte, entretenimento e os melhores vídeos na sua mão com o aplicativo Central das Notícias. Baixe agora!',
      'webKeyWords'   : 'aplicativo, notícias, vídeos, mobile, Brasil, Mundo, política, famosos, novela, esporte, jornais, tecnologia, empregos, cultura, televisão',

      'search-btn'    : 'Pesquisar',  // 搜索页－搜索按钮
      'search-placeholder' : '0 que você quer ver?',  // 搜索页－placeholder
      'search-clear'   : 'Limpar o histórico de pesquisa', // 搜索页－更多
      'search-null'   : 'Não há resultados, tente outras palavras',
      'search-title'  : 'Pesquise os conteúdos do seu interesse',
      'search-blank-1': 'Notícias',
      'search-blank-2': 'Esportes',
      'search-blank-3': 'Vídeos',
      'search-blank-4': 'TV & Fama',
    }
  },

  // 印尼的配置
  yn : {
    webUrl : 'http://berita.baca.co.id/',
    interfaceUrl : 'http://www.baca.co.id/api/v1',
    trendingBase : 'http://www.baca.co.id/api/v1',
    interfaceLog : 'http://logging.baca.co.id/api/logging',
    imgHost : 'http://baca.co.id/',
    adSearch : {
      adId : '8295896732',
      actionLink : 'http://www.google.co.id',
      link : 'https://cse.google.co.id/cse?cx={adSearchId}:{adId}&ie=UTF-8&q={key}'
    },
    ad : {
      detail : '9713754339',
      newsfeed : '2375617538',
      newsfeed300250 : '6752321132',
      detailContent : '3511149934',  // 详情页－内容广告
    },
    language : {
        'blueFreshMessage-num'  : 'konten',     // 列表页－刷新成功后－显示更新了几条的蓝色条
        'blueFreshMessage-null' : 'Tidak ada data', // 列表页－刷新成功后－没有数据
        'blueFreshMessage-trending-num' : 'topik baru',  //列表页－刷新成功后－针对Trending
        'blueFreshMessage-trending-null' : 'Tidak ada topik baru',  //列表页－刷新成功后－针对Trending

        'timeout' : 'Setelah <span id="time">5</span> detik otomatis melompat ke Depan',

        'pull-up'       : 'Lepaskan untuk update', // 松开刷新的提示
        'pull-down'     : 'Tarik untuk update', // 下拉更新的提示
        'loading'       : 'Refresh...', // 加载中的提示
        'download'      : 'Buka sekarang',                 //下载APP
        'firm'          : 'Baca',           // 黑色提示，公司名称
        'firm-intro'    : 'Berita, Video dan Humor',    //黑色提示，公司介绍
        'intoWebSite'   : 'Buka Versi Website',         // 进入页面
        'intoSite'      : 'Website Perusahaan',   // 进入官网
        'category-top'  : 'Kategori',                //选择类型页－上边的提示
        'category-show' : 'Kilk Untuk Hapus Kategori',     //选择类型页－显示类别的提示信息
        'category-hide' : 'Kilk Untuk Menambah Kategori Berikut', // 选择类型页－不现实类别的提示信息
        'share'         : 'Bagikan',    // 详情页，分享
        'shareClose'    : 'Batal',      // 详情页，分享关闭
        'relativeNews'  : 'Baca Juga',  // 详情页，相关新闻
        'oldLink'       : 'LIHAT SUMBER',    // 详情页，跳转到原始页面
        'downloadBlock' : 'DOWNLOAD BACA, BERITA SERU DAN PRAKTIS!' , // 详情页，下载块

        'search-place'  : 'Cari apa yang Anda suka',
        'like-share'    : 'Artikel disukai! <br/> Bagikan ke teman', // 点赞成功后，弹出的是否要分享

        'comment'       : 'Komentar Teratas',   // 详情页，评论
        'enterApp'      : 'Kunjungi app',   // 详情页，进入APP

        'ga'            : 'UA-111644151-1',  // 印尼的统计ID
        'linkImg'       : 'http://baca.co.id/', // 图片访问的链接

        '404-err'       : 'Halaman error',
        '404-intoSite'  : 'Website Perusahaan',


        'webTitle'      : 'BACA',
        'webDescription': 'Temukan Berbagai Macam Berita Nasional Olahraga Sepakbola Politik & Informasi Populer Lainnya Di Apps Baca, Terpercaya Dan Paling Update.',
        'webKeyWords'   : 'Baca,Aplikasi Baca,Aplikasi Berita,Apps Baca,Apps Baca Berita,Apps Berita,Berita Olahraga Apps,Berita Sepakbola Apps,Berita Nasional Apps,Berita Politik Apps',

        'search-btn'    : 'Cari',  // 搜索页－搜索按钮
        'search-placeholder' : 'Cari apa yang Anda suka',  // 搜索页－placeholder
        'search-clear'  : 'Hapus Histori', // 搜索页－更多
        'search-null'   : 'Konten tidak ditemukan Cari yang lain',
        'search-title'  : 'Apakah Anda Sudah Siap Untuk Mencari Berita Menarik?',
        'search-blank-1': 'Berita',
        'search-blank-2': 'Sepakbola',
        'search-blank-3': 'Videos',
        'search-blank-4': 'Hiburan',
        
    }
  },


  // 中东的配置
  me : {
    webUrl : 'http://nipmenews.azurewebsites.net/',
    // interfaceUrl : 'http://www.baca.co.id/api/v1',
    
    interfaceUrl : 'http://api.menanip.com/api/v1',
    trendingBase : 'http://www.baca.co.id/api/v1',
    interfaceLog : 'http://logging.baca.co.id/api/logging',
    imgHost : 'http://menanip.com/',
    adSearch : {
      adId : '8295896732',
      actionLink : 'http://www.google.co.id',
      link : 'https://cse.google.co.id/cse?cx={adSearchId}:{adId}&ie=UTF-8&q={key}'
    },
    ad : {
      detail : '9713754339',
      newsfeed : '2375617538',
      newsfeed300250 : '6752321132',
      detailContent : '3511149934',  // 详情页－内容广告
    },
    language : {
        'blueFreshMessage-num'  : 'أخبار',     // 列表页－刷新成功后－显示更新了几条的蓝色条
        'blueFreshMessage-null' : 'لم يتم العثور على الأخبار', // 列表页－刷新成功后－没有数据
        'blueFreshMessage-trending-num' : 'الموضوعات الجديدة',  //列表页－刷新成功后－针对Trending
        'blueFreshMessage-trending-null' : 'لم يتم العثور على موضوع جديد',  //列表页－刷新成功后－针对Trending

        'timeout' : 'ستذهب إلى الصفحة السابقة بعد<span id="time">5</span> ثوان',

        'pull-up'       : 'اترك للتحديث', // 松开刷新的提示
        'pull-down'     : 'احسب للأسفل للتحديث', // 下拉更新的提示
        'loading'       : 'جاري التحميل...', // 加载中的提示
        'download'      : 'شاهد في التطبيق',                 //下载APP
        'firm'          : 'زووم',           // 黑色提示，公司名称
        'firm-intro'    : 'الأخبار حول العالم العربي كله',    //黑色提示，公司介绍
        'intoWebSite'   : 'زيارة إصدار واب',         // 进入页面
        'intoSite'      : 'زيارة الموقع الرسمية',   // 进入官网
        'category-top'  : 'قنواتي',                //选择类型页－上边的提示
        'category-show' : 'اضغط لحذف القنوات',     //选择类型页－显示类别的提示信息
        'category-hide' : 'اضغط لإضافة القنوات', // 选择类型页－不现实类别的提示信息
        'share'         : 'المشاركة',    // 详情页，分享
        'shareClose'    : 'إلغاء',      // 详情页，分享关闭
        'relativeNews'  : 'الأخبار ذات الصلة',  // 详情页，相关新闻
        'oldLink'       : 'شاهد المصدر',    // 详情页，跳转到原始页面
        'downloadBlock' : 'حمل زووم لآخر الأخبار حول كل العالم العربي.' , // 详情页，下载块

        'search-place'  : 'ابحث عن ما يعجبك',
        'like-share'    : 'خبر مفضل! <br/> شاركه مع أصداقئك!', // 点赞成功后，弹出的是否要分享

        'comment'       : 'التعليقات الساخنة',   // 详情页，评论
        'enterApp'      : 'زيارة التطبيق',   // 详情页，进入APP

        'ga'            : 'UA-111644151-1',  // 印尼的统计ID - 不用管
        'linkImg'       : 'http://baca.co.id/', // 图片访问的链接 - 不用管

        '404-err'       : 'صفحة بالمشكلة',
        '404-intoSite'  : 'الموقع الرسمي',


        'webTitle'      : 'زووم',
        'webDescription': 'احصل على آخر الأخبار في مجالات الترفيه وكرة القدم والسياسة وكلما يجعبك حول العالم العربي كله',
        'webKeyWords'   : 'زووم، تطبيق زووم، تطبيق الأخبار زووم، تطبيق الأخبار الرياضية، تطبيق الأخبار العربية، تطبيق الأخبار الترفيهية، تطبيق الأخبار السياسية، تطبيق الأخبار، تطبيق الأخبار لكرة القدم',

        'search-btn'    : 'ابحث',  // 搜索页－搜索按钮
        'search-placeholder' : 'ابحث عن ما يعجبك',  // 搜索页－placeholder
        'search-clear'  : 'احذف تاريخ البحث', // 搜索页－更多
        'search-null'   : 'لم يتم العثور على أي شيء، حاول بكلمة أخرى',
        'search-title'  : 'هل مستعد لقراءة الأخبار الرائعة؟',
        'search-blank-1': 'أخبار',
        'search-blank-2': 'كرة القدم',
        'search-blank-3': 'فيديوهات',
        'search-blank-4': 'ترفيه',
        
    }
  },

  // 开发时的配置
  test : {
    webUrl : '',
    // interfaceUrl : 'http://nip-test-webapi.azurewebsites.net/api/v1',
    interfaceUrl : 'http://www.baca.co.id/api/v1',
    // interfaceUrl : 'http://api.menanip.com/api/v1',
    trendingBase : 'http://bacaservice-test.azurewebsites.net/api/v1',
    interfaceLog : 'http://logging.cennoticias.com/api/logging',
    language : {

    }
  },
}