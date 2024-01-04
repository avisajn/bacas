var Local = require('../../client/util/local.js');
var Country = Local[global.language];

module.exports = function (app) {
    app.use('/download' ,function (req, res) {
        var size = req.query.size;
        var ad = '';
        var lan = global.language;
        if(lan == 'yn'){
            if(size == '300-250'){
                ad = 'ad-yn-320_250';
            }else{
                ad = 'ad';
            }
        }else if(lan == 'bx'){
            if(size == '300-250'){
                ad = 'ad-bx-320_250';
            }else{
                ad = 'ad-bx';
            }
        }else if(lan == 'me'){
            if(size == '300-250'){
                ad = 'ad-me-320_250';
            }else{
                ad = 'ad-me';
            }
        }

    	res.render('adsense' ,{ad : ad ,lan:global.language });
    });

    app.use('/robots.txt' ,function(req ,res){
        const txt = [];
        txt.push('User-agent: Googlebot');
        txt.push('Disallow: /search/');
        txt.push('Disallow: /category/');
        txt.push('');
        txt.push('User-agent: MSNBot');
        txt.push('Disallow: /search/');
        txt.push('Disallow: /category/');
        res.set('Content-Type', 'text/plain');
        // res.type('text/plain');
        res.send(txt.join('\n'));
    });

    app.use('/sitemap.xml' ,function (req, res) {
        const arr = [];
        arr.push('<?xml version="1.0" encoding="UTF-8"?>');
        arr.push('<urlset');
        arr.push('    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
        arr.push('    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
        arr.push('    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9');
        arr.push('       http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">    ');
        arr.push('<url>');
        var lan = global.language;
        if(lan == 'yn'){
            arr.push('<loc>http://berita.baca.co.id</loc>');
        }else if(lan == 'bx'){
            arr.push('<loc>http://noticias.cennoticias.com</loc>');
        }else if(lan == 'me'){
            arr.push('<loc>http://www.menanip.com</loc>');
        }
        arr.push('<priority>1.00</priority>');
        arr.push('<lastmod>2017-07-14</lastmod>');
        arr.push('<changefreq>weekly</changefreq>');
        arr.push('</url>');
        arr.push('</urlset>');
        res.format({
            'application/json': function(){
                res.json(arr);
            },
            'application/xml': function(){
                res.type('application/xml');
                res.send(arr.join(''));
            },
            'text/xml': function(){
                res.type('text/xml');
                res.send(arr.join(''));
            },
            'text/plain': function(){
                res.type('text/plain');
                res.send(arr.join(''));
            }
        });
        // console.log(res);
        // res.xml(arr.join(''));
    });


    app.use('/search' ,function (req, res) {
        res.render('search' ,{lan:global.language ,Country : Country });
    });

    app.use('/info' ,function (req, res) {
        res.render('info' ,{lan:global.language ,Country : Country});
    });

    app.use('/frameview' ,function (req, res) {
        res.render('frameview' ,{lan:global.language ,Country : Country});
    });


    // app.use('/videoview' ,function (req, res) {
    //     const query = req.query;
    //     var url = query.url;
    //     var videoType = 'other';        // 内容的类型 twitter ,facebook ,youtube
    //     var playType = 'frame';         // 播放的类型，frame ,video


    //     if(url.indexOf('?')>0) url+='&';
    //     else url+='?';

    //     if(url.indexOf('youtube')>=0){  // youtube 的视频，后缀加
    //         if(url.indexOf('/v/') >= 0 ){
    //             url.replace('/v/' ,'/embed/');
    //         }else{
    //             if(url.indexOf('watch?v=') >= 0){
    //                 const arr = url.split('=');
    //                 url = 'https://www.youtube.com/embed/'+arr[arr.length-1];
    //             }
    //         }

            
    //         url += 'autoplay=1&';
    //         videoType = 'youtube';



    //     }else if(url.indexOf('facebook')>=0){
    //         videoType = 'facebook';
    //     }else if(url.indexOf('dailymotion')>=0){
    //         videoType = 'dailymotion';
    //         url += 'mute=1&quality=1080&sharing-enable=false&ui-logo=false&'
    //     }

    //     if(url.indexOf('.mp4') >= 0){
    //         playType = 'video';
    //     }

    //     url += 'showinfo='+(query.showinfo||false)+'&autoplay=1&modestbranding=0&fs=0';
    //     console.log('url:',url);

    //     // device     = [android,IOS] // 移动端类型
    //     // url                  // video的地址
    //     // search               // 移动端传的参数
    //     // showinfo   
    //     // width      
    //     // height
    //     res.render('videoview' ,{
    //         url : url ,
    //         type : playType ,
    //         width : query.width || '100%' ,
    //         height : query.height || '100%' ,
    //     });
    // });

    app.use('/adview' ,function (req, res) {
        const query = req.query;
        res.render('adview' ,{width:query.w ,height : query.h});
    });

    app.use('/category', require('./category'));
    app.use('/', require('./news'));


    app.use(function(req, res, next) {
    	// 404页面
	  	res.render('404',{
	    	Country : Country
	    });
	});

};
