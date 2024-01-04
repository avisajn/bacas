
var MVC = (function() {

	var M = (function() {
		var _M = {}
		return {
			add: function(path, data) {
				var pathArr = path.split(".");
				var result = _M;
				for(var i = 0; i < pathArr.length - 1; i++) {
					var temp =  result[pathArr[i]];
					if(typeof temp === "object" && temp != null || typeof temp === "function") {
						result = result[pathArr[i]];
					} else if(typeof temp === "undefined") {
						result[pathArr[i]] = {};
						result = result[pathArr[i]];
					} else {
						throw new Error("不可以往值类型身上添加属性");
					}
				}
				if(typeof result[pathArr[i]] != "undefined") {
					throw new Error("不要占用别人的地方");
				} else {
					result[pathArr[i]] = data;
				}
			},
			get: function(path) {
				var pathArr = path.split(".");
				var result = _M;
				for(var i = 0; i < pathArr.length - 1; i++) {
					var temp = result[pathArr[i]];
					if(typeof temp === "object" && temp != null || typeof temp === "function") {
						result = result[pathArr[i]];
					} else {
						return null;
					}
				}
				return result[pathArr[i]];
			}
		}
	})();
	var V = (function() {
		var _V = {
		};
		return {
			
			add: function(key, fun) {
				_V[key] = fun;
			},
			create: function(key) {
				return _V[key](M);
			}
		}
	})()
	var C = (function() {
		var _C = {
		};
		return {
			add: function(key, fun) {
				_C[key] = fun;
			},
			/**
			 * 初始化所有的控制器
			 */
			init: function() {
				for(var i in _C) {
					_C[i](M, V);
				}
			}
		}
	})()
	return {
		addModel: function(key, value) {
			M.add(key, value);
		},
		addView: function(key, value) {
			V.add(key, value);
		},
		addCtrl: function(key, value) {
			C.add(key, value)
		},
		install: function() {
			C.init();
		}
	}
})()