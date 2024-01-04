// 既然是一个JS框架，那么肯定会向外暴露一些内容 
// 所以应该暴露的是一个对象 
// 该对象能够提供方法操作三个模块M、V、C
var MVC = (function() {
	var M = (function() {
		var _M = {
		}

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
			/**
			 * 从M层中获取内容
			 * @path string 要获取的数据的所在层级
			 * @return any 得到的数据
			 */
			get: function(path) {
				var pathArr = path.split(".");
				var result = _M;
				// 循环
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
			/**
			 * @key string 创建函数的名称
			 */
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