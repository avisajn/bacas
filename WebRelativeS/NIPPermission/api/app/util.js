'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.getDays = getDays;
exports.decryptCode = decryptCode;
exports.encryptCode = encryptCode;

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 得到结束日期距当前日期的天数
// 俩日期相减，返回天数
function getDays(endDate) {
	var date = new Date();
	var y = date.getFullYear();
	var m = date.getMonth();
	var d = date.getDate();

	var array = endDate.split("-");
	var endTime = new Date(parseInt(array[0]), parseInt(array[1]) - 1, parseInt(array[2]));
	var nowTime = new Date(parseInt(y), parseInt(m), parseInt(d));
	var day = (Number(endTime) - Number(nowTime)) / (1000 * 60 * 60 * 24);
	return day;
}

// 使用 ECB ， PKCS5 或 PKCS7
// 

var key = 'bacanews';

// 解密
function decryptCode(code) {
	var keyHex = _cryptoJs2.default.enc.Utf8.parse(key);
	var decrypted = null;
	try {
		decrypted = _cryptoJs2.default.DES.decrypt({ ciphertext: _cryptoJs2.default.enc.Base64.parse(code) }, keyHex, {
			mode: _cryptoJs2.default.mode.ECB,
			padding: _cryptoJs2.default.pad.Pkcs7
		});
	} catch (e) {
		return;
	}
	return JSON.parse(decrypted.toString(_cryptoJs2.default.enc.Utf8));
}

// 加密
function encryptCode(obj) {
	var keyHex = _cryptoJs2.default.enc.Utf8.parse(key);
	var encrypted = null;
	try {
		encrypted = _cryptoJs2.default.DES.encrypt((0, _stringify2.default)(obj), keyHex, {
			mode: _cryptoJs2.default.mode.ECB,
			padding: _cryptoJs2.default.pad.Pkcs7
		});
	} catch (e) {
		return;
	}
	return encrypted.toString();
}
//# sourceMappingURL=util.js.map