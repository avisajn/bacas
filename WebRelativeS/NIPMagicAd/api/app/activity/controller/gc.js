'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

var _util = require('../../util.js');

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.activity;

var cache = (0, _lruCache2.default)({ maxAge: 1000 * 60 * 30 });

// http://img.cdn.baca.co.id/event/top10/avatar/1.png
var getRandom = function getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
};

var getFixed = function getFixed(v) {
    var fixNum = new Number(v + 1).toFixed(2); //四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
};

var verifyToken = function verifyToken(token) {
    try {
        var res = (0, _util.decryptCode)(token, 'ymark-campaign');
        if (!res || !res.userid || !res.utc || res.userid == 'wap_') return false;
        var date_time = new Date(res.utc);
        // if(typeof(date_time) != 'object') return false;
        // const current_utc_str = (new Date()).toUTCString();
        // const current_utc_time = (new Date( current_utc_str  )).getTime();
        // 差值必须小于20分钟以内
        // if(parseInt(Math.abs(date_time.getTime() - current_utc_time)/(1000*60)) >= 20){
        // return false;
        // }
        return res.userid;
    } catch (e) {
        return false;
    }
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.userAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _post, t, user_id, localData;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(!this.allow || this.method != 'post')) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            _post = this.post();
                            t = _post.t;

                            if (t) {
                                _context.next = 6;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 6:
                            user_id = verifyToken(t);

                            if (user_id) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1.2, '参数错误！'));

                        case 9:
                            localData = cache.get('user_id_object');

                            if (!(localData && localData[user_id])) {
                                _context.next = 12;
                                break;
                            }

                            return _context.abrupt('return', this.success(localData[user_id]));

                        case 12:
                            return _context.abrupt('return', this.fail(-2, 'null'));

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function userAction() {
            return _ref.apply(this, arguments);
        }

        return userAction;
    }();

    _class.prototype.alluserAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var model, list;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            model = this.model('gc_user_temp', db);
                            _context2.next = 3;
                            return model.field('name,sex,phone,city').select();

                        case 3:
                            list = _context2.sent;
                            return _context2.abrupt('return', this.json(list));

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function alluserAction() {
            return _ref2.apply(this, arguments);
        }

        return alluserAction;
    }();

    _class.prototype.adduserAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var _post2, name, phone, city, userid, sex, model, new_id, localData;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(!this.allow || this.method != 'post')) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            _post2 = this.post();
                            name = _post2.name;
                            phone = _post2.phone;
                            city = _post2.city;
                            userid = _post2.userid;
                            sex = _post2.sex;

                            if (!(!name || !phone || !city || !sex || !userid)) {
                                _context3.next = 10;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1.21, '参数错误！'));

                        case 10:
                            model = this.model('gc_user_temp', db);
                            _context3.next = 13;
                            return model.add({
                                name: name,
                                phone: phone,
                                city: city,
                                sex: sex,
                                user_id: userid
                            });

                        case 13:
                            new_id = _context3.sent;

                            if (!(new_id > 0)) {
                                _context3.next = 21;
                                break;
                            }

                            localData = cache.get('user_id_object') || {};

                            localData[userid] = { name: name, phone: phone, city: city };
                            cache.set('user_id_object', localData);
                            return _context3.abrupt('return', this.success('添加成功！'));

                        case 21:
                            return _context3.abrupt('return', this.fail(-2, '添加失败！'));

                        case 22:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function adduserAction() {
            return _ref3.apply(this, arguments);
        }

        return adduserAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=gc.js.map