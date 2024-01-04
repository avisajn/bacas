require("./index.scss");
require("../common/common.js");
require("../common/layer.js");
require("../common/layer.scss");



require('../common/img/share.png');
require('../common/img/facebook.png');
require('../common/img/bbm.png');
require('../common/img/whatsapp.png');

require('../common/img/icons2.png');

require('./bck-info.png');
require('./down-bck-bx.png');
require('./down-bck-yn.png');

require('./share-down-bx.png');
require('./share-down-yn.png');

window.closeShareShadow = function(){
	window.ga('send', 'event', window.page, 'share-click', 'closeModal');
	$('.share-hand').addClass('hide');
}


window.toIndex = function(){
	window.ga('send', 'event', 'detail', 'recreate', window.newTitle);
	window.location.href = '/';
}


// window.shareClick.showShare();