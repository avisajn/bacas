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

    // 获得排名


    _class.prototype.rankingAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _get, _get$page, page, localData, model, lists;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (this.allow) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            _get = this.get();
                            _get$page = _get.page;
                            page = _get$page === undefined ? 1 : _get$page;
                            localData = cache.get('pt-ranking' + page);

                            if (!(localData && localData.length > 0)) {
                                _context2.next = 8;
                                break;
                            }

                            return _context2.abrupt('return', this.success(localData));

                        case 8:
                            model = this.model('pt_user', db);
                            _context2.next = 11;
                            return model.field('name ,time').limit(0, 20).order('time').select();

                        case 11:
                            lists = _context2.sent;

                            cache.set('pt-ranking' + page, lists);
                            return _context2.abrupt('return', this.success(lists));

                        case 14:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function rankingAction() {
            return _ref2.apply(this, arguments);
        }

        return rankingAction;
    }();

    _class.prototype.addAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var _post2, ent, res, time, name, phone, city, t, user_id, model, old_list, new_id, localData;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            console.log('add--->interface');

                            if (!(!this.allow || this.method != 'post')) {
                                _context3.next = 3;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _post2 = this.post();
                            ent = _post2.t;

                            if (ent) {
                                _context3.next = 7;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1.1, '参数错误！'));

                        case 7:
                            res = (0, _util.simpleDecryptCode)(ent, 'only-test');

                            if (res) {
                                _context3.next = 10;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1.2, '参数错误！'));

                        case 10:
                            time = res.time;
                            name = res.name;
                            phone = res.phone;
                            city = res.city;
                            t = res.t;

                            if (!(!time || !name || !phone || !city || !t)) {
                                _context3.next = 17;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1.21, '参数错误！'));

                        case 17:
                            user_id = verifyToken(t);

                            console.log('验证结束！', t, '  ++userid++:', user_id);

                            if (user_id) {
                                _context3.next = 21;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1.3, '参数错误！'));

                        case 21:
                            model = this.model('pt_user', db);
                            // 查询一下

                            _context3.next = 24;
                            return model.field('id,time').where(" phone='" + phone + "' and name='" + name + "' ").select();

                        case 24:
                            old_list = _context3.sent;

                            console.log('old_list:', old_list);

                            if (!(old_list && old_list.length > 0)) {
                                _context3.next = 36;
                                break;
                            }

                            if (!(time < old_list[0].time)) {
                                _context3.next = 33;
                                break;
                            }

                            // 则意味着 需要更新数据库
                            cache.del('pt-ranking');
                            _context3.next = 31;
                            return model.where('id=' + old_list[0].id).update({ time: time });

                        case 31:
                            console.log('刷新成绩！');
                            return _context3.abrupt('return', this.success('已经刷新成绩！'));

                        case 33:
                            return _context3.abrupt('return', this.success('无需添加，不是最好的成绩'));

                        case 36:
                            console.log('开始添加！');
                            _context3.next = 39;
                            return model.add({
                                time: time, // 发起用户姓名
                                name: name,
                                phone: phone,
                                city: city,
                                user_id: user_id
                            });

                        case 39:
                            new_id = _context3.sent;

                            console.log('添加结果！', new_id);

                            if (!(new_id > 0)) {
                                _context3.next = 50;
                                break;
                            }

                            localData = cache.get('user_id_object') || {};

                            localData[user_id] = { name: name, phone: phone, city: city };
                            cache.set('user_id_object', localData);
                            cache.del('pt-ranking');
                            console.log('添加成功！');
                            return _context3.abrupt('return', this.success('添加成功！'));

                        case 50:
                            return _context3.abrupt('return', this.fail(-2, '添加失败！'));

                        case 51:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function addAction() {
            return _ref3.apply(this, arguments);
        }

        return addAction;
    }();

    _class.prototype.alluserAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var model, list;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            model = this.model('pt_user_temp', db);
                            _context4.next = 3;
                            return model.field('name,phone,city').select();

                        case 3:
                            list = _context4.sent;
                            return _context4.abrupt('return', this.json(list));

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function alluserAction() {
            return _ref4.apply(this, arguments);
        }

        return alluserAction;
    }();

    _class.prototype.passuserAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var model, list;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            model = this.model('pt_user', db);
                            _context5.next = 3;
                            return model.field('name,phone,city,time').select();

                        case 3:
                            list = _context5.sent;
                            return _context5.abrupt('return', this.json(list));

                        case 5:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function passuserAction() {
            return _ref5.apply(this, arguments);
        }

        return passuserAction;
    }();

    _class.prototype.adduserAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
            var _post3, name, phone, city, userid, model, new_id, localData;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!(!this.allow || this.method != 'post')) {
                                _context6.next = 2;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            _post3 = this.post();
                            name = _post3.name;
                            phone = _post3.phone;
                            city = _post3.city;
                            userid = _post3.userid;

                            if (!(!name || !phone || !city || !userid)) {
                                _context6.next = 9;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-1.21, '参数错误！'));

                        case 9:
                            model = this.model('pt_user_temp', db);
                            _context6.next = 12;
                            return model.add({
                                name: name,
                                phone: phone,
                                city: city,
                                user_id: userid
                            });

                        case 12:
                            new_id = _context6.sent;

                            if (!(new_id > 0)) {
                                _context6.next = 20;
                                break;
                            }

                            localData = cache.get('user_id_object') || {};

                            localData[userid] = { name: name, phone: phone, city: city };
                            cache.set('user_id_object', localData);
                            return _context6.abrupt('return', this.success('添加成功！'));

                        case 20:
                            return _context6.abrupt('return', this.fail(-2, '添加失败！'));

                        case 21:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function adduserAction() {
            return _ref6.apply(this, arguments);
        }

        return adduserAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=pt.js.map