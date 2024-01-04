const $commentPanel = $('#bottomCommentPanel');
const API = require('./api.js');

const avatarList = [
	'http://img.cdn.baca.co.id/event/top10/avatar/1.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/10.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/11.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/12.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/13.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/14.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/15.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/16.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/2.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/3.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/4.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/5.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/6.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/7.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/8.png',
	'http://img.cdn.baca.co.id/event/top10/avatar/9.png',
];
const getCommentItem = function(k){
	const html = [];
	html.push('<li class="clearfix">');
	html.push('	<div class="avatar" style="background-image: url(http://img.cdn.baca.co.id/event/top10/avatar/'+k.avatar+');"></div>');
	html.push('	<div class="content">');
	html.push('		'+k.content);
	html.push('	</div>');
	html.push('</li>');
	return html.join('');
}
const topic_at_mapping = {
	'_10' : "Fakta Golongan Darah",
	"_9" : "Zakir Naik",
	"_8" : "DP 0 Rupiah",
	"_7" : "Uang Kuno",
	"_6" : "Ayu Ting Ting",
	"_5" : "ABG Nikahi Nenek Tua",
	"_4" : "Pilkada DKI Jakarta",
	"_3" : "Raja Salman",
	"_2" : "Julia Perez",
	"_1" : "Ahok vs Habib Rizieq",
};

module.exports =  {
	init : function(){
		const $valComments = $('#myComments');
		$('.sprite-expend,.comment-lists').on('click' ,function(){
			if($commentPanel.hasClass('expand-all')){
				$commentPanel.removeClass('expand-all');
			}else{
				$commentPanel.addClass('expand-all');
			}
		});
		$('.tip-comment').on('click' ,function(){
			const prex = $(this).parent('.trending-item').attr('_tpid');
			$valComments.val('#'+topic_at_mapping['_'+prex]+'  ');
			$valComments.focus();
			$commentPanel.addClass('expand-all');
		})
		const $comments = $('#commentsHtml');
		API.getComments(function(e){
			if(e && e.length > 0){
				const html = [];
				for(var i=0,len=e.length;i<len;i++){
					html.push(getCommentItem(e[i]));
				}
				$comments.html(html.join(''));
			}
		});
		
		const $formLoading = $('#formLoading');
		$('.sprite-send').on('touchstart',function(){
			const val = $valComments.val();
			if(!val) return;
			$formLoading.removeClass('hide');
			API.sub(val ,function(e){
				$formLoading.addClass('hide');
				if(e.err) return alert('failed');
				$valComments.val('');
				$comments.prepend(getCommentItem({avatar:e, content:val}));
				alert('success');
			});
		})
	},
	

}