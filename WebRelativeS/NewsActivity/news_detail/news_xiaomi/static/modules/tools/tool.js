define(function(require, exports, module) {
	var Observer = (function() {
		var _O = {}
		return {
			on: function(type, fun) {
				if(_O[type]) {
					_O[type].push(fun);
				} else {
					_O[type] = [fun];
				}
			},
			trigger: function(type) {
				var args = [].slice.call(arguments, 1);
				if(_O[type]) {
					for(var i = 0; i < _O[type].length; i++) {
						_O[type][i].apply(_O, args);
					}
				} 
			}
		}
	})()
	module.exports.Observer = Observer;
})