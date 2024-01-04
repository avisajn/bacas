define(function(require, exports, module) {
	var Observer = (function() {
		var _O = {

		}
		return {
			on: function(type, fun) {
				// 先检测是否已经存在 
				if(_O[type]) {
					_O[type].push(fun);
				} else {
					_O[type] = [fun];
				}
			},
			trigger: function(type) {
				// 获取剩余参数
				var args = [].slice.call(arguments, 1);
				if(_O[type]) {
					for(var i = 0; i < _O[type].length; i++) {
						_O[type][i].apply(_O, args);
					}
				} 
			}
		}
	})()
	// 暴露出去
	module.exports.Observer = Observer;
})