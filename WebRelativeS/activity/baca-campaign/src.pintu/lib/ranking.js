const API = require('./common/api');
const $list = $('#ul_rankingList');

var rankingData = [];

const getItem = function (k ,i) {
	const html = [];
	html.push('<li class="inset-shadow-panel  radius-2 myfamily ranking-item">');
	html.push('	<div class="item-panel clearfix">');
	html.push('		<div class=" '+(i<=3?'sprite sprite-number-'+i:'normal-number')+'">'+i+'</div>');
	html.push('		<span class="name">'+k.name+'</span>');
	html.push('		<span class="time">'+window.getTimeStr(parseInt(k.time))+'</span>');
	html.push('	</div>');
	html.push('</li>');
	return html.join('');
}

const loadHtml = function (data) {
	var html = [];
	for(var i=0,len=data.length;i<len;i++){
		html.push(getItem(data[i] ,i+1));
	}
	$list.html(html.join(''));

}



module.exports =  {
	init : function () {
		if(rankingData.length > 0) return;
		$list.html('<div class="loading"> loading... </div>');
		API.getRanking(function (e) {
			if(e.err || e.length <= 0) return;
			e = e.sort(function(v1, v2){
				return parseInt(v1.time)-parseInt(v2.time);
			});
			rankingData = e;
			loadHtml(rankingData);
		})
	}
}