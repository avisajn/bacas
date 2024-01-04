var prefix1 = "baca-lucky/store/"; //第一级存储名前辍,不能变
var prefix2 = location.hostname + "/"; //第二级存储名前辍,可变
//缓存名前辍,这样的设计思想是防止同一域名下,不同应用路径的页面间,储存的key冲突
var prefixCache = prefix1 + prefix2; //key前辍
var maxStoreTime = 1 * 24 * 60 * 60; //最长存储7天数据,单位为秒


module.exports =  {
	_window : window,

	_ttlTime : function(ttl){
		ttl = Math.abs(ttl);
		ttl = ttl > maxStoreTime ? maxStoreTime : ttl; //最长7天
		return new Date().getTime() + ttl * 1000;
	},
	//从localstorage取数据,不对key做处理
	_get : function(key){
		var oldKey = (key || "").replace(prefixCache, "");
		try {
			var value = this._window.localStorage[key];
			if (value) {
				var item = JSON.parse(value);
				if (item && item.ttl) {
					if (item.ttl >= 0 && item.ttl <= new Date().getTime()) {
						this.remove(oldKey);
						return null
					}
					return item.data
				}
			}
		} catch (e) {
			this.remove(oldKey);
			// console.log("get store data error:", e);
		}
		return null
	},
	//储存到本地缓存,不对key做处理
	_set : function(key, value, ttl){
		try {
			ttl = ttl || 60 * 60; //默认1小时
			var item = {
				data: value,
				ttl: this._ttlTime(ttl)
			};
			this._window.localStorage[key] = JSON.stringify(item);
		} catch (e) {
			console.log(e);
		}
	},
	_getKey : function(key){
		return prefixCache + key;
	},


	setWindow : function(win){
		if(!win) return;
		this._window = win;
	},
	set: function(key, value, ttl) { // 储存到localStorage,ttl:unit is second
		if(!this._window) return;
		key = this._getKey(key);
		this._set(key, value, ttl);
	},
	get: function(key) { //对key做处理,取数据并返回
		if(!this._window) return;
		key = this._getKey(key);
		return this._get(key);
	},
	remove: function(key) {
		if(!this._window) return;
		key = this._getKey(key);
		delete this._window.localStorage[key];
	},
	clear: function() {
		if(!this._window) return;
		try {
			this._window.localStorage.clear()
		} catch (e) {
			this._window.localStorage = {};
		}
	}
}