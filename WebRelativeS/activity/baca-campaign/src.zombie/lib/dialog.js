const $dialogPanel = $('#dialogPanel');
const $dialogText = $('#dialogText');
const Typed = require('typed.js');

var typedControl = null;
var isComplate = false;
var callback = null;

const typeSpeed = 35;
// const typeSpeed = 0;

module.exports =  {
	init : function(){
		$dialogPanel.click(function(){
			if(isComplate){
				$dialogPanel.addClass('hide');
				$dialogText.addClass('hide');
				const a = callback;
				callback = null;
				a();
			}else{
				// var strings = typedControl.strings;
				// strings = strings[strings.length-1];
				// typedControl.destroy();
				// typedControl = null;
				// $dialogText.html(strings);
				// isComplate = true;
			}
		});
	},
	reload : function (content_arr ,_callback) {
		isComplate = false;
		$dialogPanel.removeClass('hide');
		$dialogText.removeClass('hide');
		if(typedControl){
			typedControl.destroy();
			typedControl = null;
		}
		$dialogText.html('');
		callback = _callback;
		typedControl = new Typed('#dialogText', {
		    strings: content_arr,
		    // typeSpeed: 20,
		    typeSpeed: typeSpeed,
		    backSpeed: 0,
		    fadeOut: true,
		    loop: false,
		    onComplete : function(){
		    	isComplate = true;
		    }
		});
	},


	showsimple : function(id, content_arr ,_callback){
		isComplate = false;
		$dialogPanel.removeClass('hide');
		typedControl = null;
		typedControl = new Typed(id, {
		    strings: content_arr,
		    typeSpeed: typeSpeed,
		    backSpeed: 0,
		    fadeOut: true,
		    loop: false,
		    onComplete : function(){
		    	callback = _callback;
		    	isComplate = true;
		    }
		});
	}

}