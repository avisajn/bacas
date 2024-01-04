var Local = require('../../client/util/local.js');
var Country = Local[global.language];

module.exports = function (app) {
    app.use('/', require('./fool'));
};
