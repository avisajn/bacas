var express = require('express'),
    router = express.Router();

var Local = require('../../client/util/local.js');
var Country = Local[global.language];

router.get('/', function(req, res) {
    res.render('category',{
    	Country : Country
    });
});

module.exports = router;