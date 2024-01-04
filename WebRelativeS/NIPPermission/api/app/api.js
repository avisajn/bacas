'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	getUserId: function getUserId() {

		return Fetch({
			url: 'http://adnetwork.hadoopfinetech.com/adnetwork/apply_for_account',
			method: 'get',
			body: {
				code: (0, _util.encryptCode)({ time: new Date().getTime() + 5 * 60 * 1000 })
			}
		});
	}
};


var Fetch = function Fetch(config) {
	return new _promise2.default(function (resolve, f) {

		config.method = config.method || 'get';
		var _url = config.url;
		// if(!config.notCross) _url = _baseUrl + _url; 
		var body = config.body;
		console.log('开始请求:', new Date().getTime() + ':', _url, (0, _stringify2.default)(body || {}));
		var req = _superagent2.default;

		if (config.method === 'get') req = req.get(_url);else if (config.method === 'post') req = req.post(_url);else if (config.method === 'put') req = req.put(_url);else if (config.method === 'delete') req = req.delete(_url);

		if (body) {
			if (config.method === 'get') req = req.query(body);else req = req.send(body);
		}

		if (config.attach) req = req.set('enctype', 'multipart/form-data');
		if (config.withCredentials) req = req.withCredentials(true);

		req.end(function (err, res) {
			if (err || !res) {
				resolve({ err: err.toString() });return;
			}
			if (res.error) {
				resolve({ err: res.text });return;
			}

			res = JSON.parse(res.text || '{}');
			if (res.errno < 0) {
				resolve({ err: res.errmsg, errno: res.errno });
				return;
			}
			console.log('结束请求:', new Date().getTime(), (0, _stringify2.default)(res));
			resolve(res || {});
		});
	});
};
//# sourceMappingURL=api.js.map