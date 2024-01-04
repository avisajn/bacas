'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _util = require('../../util.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 得到一个KEY
    _class.prototype.getAction = function getAction() {
        var _get = this.get();

        var time = _get.time;
        // if(!time || !this.allow) return this.fail(-1,'参数不正确！');

        var currentTime = new Date().getTime() + 3000;
        // console.log('get:::服务器时间: ',currentTime,'  接收到的时间: ' ,time ,'  currentTime < time:',currentTime < time ,'  time < (currentTime-1000*15):',time < (currentTime-1000*15))
        // 这里存在时区转换的问题
        // if(currentTime < time || time < (currentTime-1000*15)) return this.fail(-2,'参数2不正确');
        // if(!( currentTime>=time && time>=(currentTime-1000*15) )) return this.fail(-2,'参数不正确');
        var keyName = 'ymark-yuxiaoli-' + (currentTime - parseInt(time));
        // 这里面有10秒的操作时间-如果接口再10秒之内没有开始请求，则算作失败
        var key = (0, _util.encryptCode)({ expire: new Date().getTime() + 1000 * 10, ran: Math.random() * 10000 }, keyName);
        var right_arr = [];
        var left_arr = [];
        var idx = Math.floor(1 + Math.random() * (10 - 1));;
        key.substr(key.length - idx).split('').map(function (k) {
            var v = k.charCodeAt(0);
            if (v < 100) right_arr.push('0' + v);else right_arr.push(v);
        });
        key.substr(0, idx).split('').map(function (k) {
            var v = k.charCodeAt(0);
            if (v < 100) left_arr.push('0' + v);else left_arr.push(v);
        });

        return this.success({
            k: Math.random() * 19990 + '898.88' + Math.random() * 100 + '<' + key.substring(idx, key.length - idx) + '>' + Math.random() * 1000 + '09287.' + Math.random() * 1000 + '' + idx,
            l: parseInt(Math.random() * 19990) + '.' + time + '.970' + left_arr.join(''),
            r: parseInt(Math.random() * 19990) + '.' + currentTime + '.786' + right_arr.join('')
        });
    };

    // 破解一个KEY
    // sAction(){
    //     return this.fail(-1);
    //     // 先得到keyName
    //     const {l:left_str ,r:right_str ,k:key_str} = {"k":"6035.018649106313898.8855.31807250147578<K6a617U+0Ji7BNLdkEbfNOTxbtH+IIVRTy/TQeTCYkLdXk7EatVorHGgyQvCRpHl+vKBhDLxeg>628.274665205293609287.111.834312803066551","l":"15032.1508305358441.970054","r":"16806.1508312472553.786061","key":"6K6a617U+0Ji7BNLdkEbfNOTxbtH+IIVRTy/TQeTCYkLdXk7EatVorHGgyQvCRpHl+vKBhDLxeg=","keyName":"ymark-yuxiaoli-7114112"} || {};
    //     if(!left_str || !right_str || !key_str || left_str.indexOf('.970')<0 || right_str.indexOf('.786')<0) return this.fail(-1,'参数不正确！');
    //     const left_arr = left_str.split('.');
    //     const right_arr = right_str.split('.');
    //     try{ 
    //         const key_name = 'ymark-yuxiaoli-'+(parseInt(right_arr[1]) - parseInt(left_arr[1]));
    //         const idx = key_str.substr(key_str.length-1);   // 获取idx
    //         const left_key = left_arr[2].substr(3);
    //         const right_key = right_arr[2].substr(3);
    //         let _lk = '';
    //         let _rk = '';
    //         for(var i=0;i<idx;i++){
    //             _lk += String.fromCharCode(parseInt(left_key.substring(3*i ,3*(i+1))));
    //             _rk += String.fromCharCode(parseInt(right_key.substring(3*i ,3*(i+1))));
    //         }
    //         let code = key_str.match(/\<(.*?)\>/gi)[0];
    //         code = _lk+''+(code.substring(1 ,code.length-1))+''+_rk;
    //         return this.success(decryptCode(code ,key_name));
    //         // 获取到完整的key
    //     }catch(e){
    //         return this.fail(-1,'错误！');
    //     }
    //     return this.success(1);
    // }

    // 验证token是否有效


    _class.prototype.valAction = function valAction() {
        var _get2 = this.get();

        var time = _get2.time;
        var p = _get2.p;

        if (!time || !p || !this.allow) return this.fail(-1, '参数不正确！');
        var currentTime = new Date().getTime() + 3000;
        // console.log('val:::服务器时间: ',currentTime,'  接收到的时间: ' ,time ,'  currentTime < time:',currentTime < time ,'  time < (currentTime-1000*15):',time < (currentTime-1000*15))
        // 这里存在时区转换的问题
        if (!(currentTime >= time && time >= currentTime - 1000 * 15)) return this.fail(-2, '参数不正确');
        var res = (0, _util.decryptCode)(p, 'ymark-login-user-info');
        if (!res || !res.id || !res.completeInfo && !res.phone && !res.name) return this.success(false);
        return this.success({ username: res.username, avatar: res.avatar, end: res.vip_end_time || '', ci: res.completeInfo, id: res.id });
    };

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=user.js.map