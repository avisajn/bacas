var express = require('express'),
    path = require('path'),
    consolidate = require('consolidate');

var isDev = process.env.NODE_ENV === 'dev';
var app = express();
var port = 8084;
var defaultLanguage = 'yn'; // 默认语言为印尼


app.engine('html', consolidate.nunjucks);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './server/views'));


// local variables for all views
app.locals.env = isDev ? 'dev' : 'production';
app.locals.reload = true;


global.env = isDev ? 'dev' : 'production';
app.locals.language = defaultLanguage;
global.language = defaultLanguage;


// static assets served by express.static() for production
app.use(express.static(path.join(__dirname, 'public')));
require('./server/routes')(app);
app.listen(port, function () {
    console.log('App (production) is now running on port '+port+'!');
});