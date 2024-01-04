var Local = require('../../client/util/local.js');
var Country = Local[global.language];

module.exports = function (app) {
    // app.use('/download' ,function (req, res) {
    //     var size = req.query.size;
    //     var ad = '';
    //     var lan = global.language;
    //     if(lan == 'yn'){
    //         if(size == '300-250'){
    //             ad = 'ad-yn-320_250';
    //         }else{
    //             ad = 'ad';
    //         }
    //     }else if(lan == 'bx'){
    //         if(size == '300-250'){
    //             ad = 'ad-bx-320_250';
    //         }else{
    //             ad = 'ad-bx';
    //         }
    //     }else if(lan == 'me'){
    //         if(size == '300-250'){
    //             ad = 'ad-me-320_250';
    //         }else{
    //             ad = 'ad-me';
    //         }
    //     }

    // 	res.render('adsense' ,{ad : ad ,lan:global.language });
    // });

    // app.use('/robots.txt' ,function(req ,res){
    //     const txt = [];
    //     txt.push('User-agent: Googlebot');
    //     txt.push('Disallow: /search/');
    //     txt.push('Disallow: /category/');
    //     txt.push('');
    //     txt.push('User-agent: MSNBot');
    //     txt.push('Disallow: /search/');
    //     txt.push('Disallow: /category/');
    //     res.set('Content-Type', 'text/plain');
    //     // res.type('text/plain');
    //     res.send(txt.join('\n'));
    // })


    // app.use('/search' ,function (req, res) {
    //     res.render('search' ,{lan:global.language ,Country : Country });
    // });

    // app.use('/info' ,function (req, res) {
    //     res.render('info' ,{lan:global.language ,Country : Country});
    // });

    // app.use('/frameview' ,function (req, res) {
    //     res.render('frameview' ,{lan:global.language ,Country : Country});
    // });

    // app.use('/adview' ,function (req, res) {
    //     const query = req.query;
    //     res.render('adview' ,{width:query.w ,height : query.h});
    // });

    // app.use('/category', require('./category'));
    app.use('/', require('./news'));


    app.use(function(req, res, next) {
    	// 404页面
	  	res.render('404',{
	    	Country : Country
	    });
	});

};
