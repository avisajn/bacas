const music_bck = document.getElementById("music_bck");

var _is_play = false;

module.exports =  {
	init : function(){
		if(_is_play) return;
		_is_play = true;
		music_bck.play();
	},
	play : function () {
		music_bck.play();
	},
	pause : function(){
		music_bck.pause();
	}
}