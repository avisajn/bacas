const music = {
	die_1 : document.getElementById("music_die_1"),
	die_2 : document.getElementById("music_witch_shout"),
	die_3 : document.getElementById("music_girl_shout"),
	die_4 : document.getElementById("music_zombie_shout"),
	switch_page : document.getElementById("music_switch_page"),
	bck : document.getElementById("music_bck"),
	appear_zombie : document.getElementById('music_appear_zombie'),
	click : document.getElementById('music_click'),
	open_door : document.getElementById('music_open_door'),
}

module.exports =  {
	// 播放背景音乐
	init : function(){
		const music_bck = music['bck'];
		// music_bck.currentTime = 0;
		music_bck.play();
	},
	//
	play : function (type) {
		const current = music[type];
		current.currentTime = 0;
		current.play();
	},

	// num = 第num种死法
	playDie : function(num){
		const current = music['die_'+num];
		current.currentTime = 0;
		current.play();
	}

}