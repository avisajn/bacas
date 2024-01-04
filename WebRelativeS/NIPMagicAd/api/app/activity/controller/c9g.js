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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.activity;

var getRandom = function getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
};

var getFixed = function getFixed(v) {
    var fixNum = new Number(v + 1).toFixed(2); //四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 根据uk获取用户信息
    _class.prototype.getinfoAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _get, ud, model_all_user, users;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get = this.get();
                            ud = _get.ud;

                            if (ud) {
                                _context.next = 7;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 7:
                            model_all_user = this.model('all_user', db);
                            _context.next = 10;
                            return model_all_user.field('id,name,phone,address').where("k='" + ud + "'").select();

                        case 10:
                            users = _context.sent;

                            if (!(users.length <= 0)) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', this.success(null));

                        case 13:
                            users = users[0];
                            return _context.abrupt('return', this.success(users));

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getinfoAction() {
            return _ref.apply(this, arguments);
        }

        return getinfoAction;
    }();

    // 提交信息


    _class.prototype.subAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _post, user_key, user_id, name, phone, res, address, support_girl, model_girl, num, model_all_user, uid;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _post = this.post();
                            user_key = _post.uk;
                            user_id = _post.uid;
                            name = _post.name;
                            phone = _post.phone;
                            res = _post.res;
                            address = _post.address;
                            support_girl = _post.sp;

                            if (!(!name || !phone || !address || !support_girl || !res)) {
                                _context2.next = 13;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数错误！'));

                        case 13:
                            model_girl = this.model('campagin9girl', db);
                            _context2.next = 16;
                            return model_girl.where(' name=\'' + name + '\' and phone=\'' + phone + '\' ').select();

                        case 16:
                            num = _context2.sent;

                            if (!(num.length > 0)) {
                                _context2.next = 19;
                                break;
                            }

                            return _context2.abrupt('return', this.success({ id: num[0].id, err: '重复添加' }));

                        case 19:
                            model_all_user = this.model('all_user', db);

                            if (!(user_id || user_key)) {
                                _context2.next = 29;
                                break;
                            }

                            if (user_id) {
                                _context2.next = 27;
                                break;
                            }

                            _context2.next = 24;
                            return model_all_user.add({
                                k: user_key, // 题库ID
                                name: name, // 发起用户姓名
                                phone: phone, // 发起用户ID
                                address: address,
                                avatar: '-'
                            });

                        case 24:
                            user_id = _context2.sent;
                            _context2.next = 29;
                            break;

                        case 27:
                            _context2.next = 29;
                            return model_all_user.where('id=' + user_id + ' and k=\'' + user_key + '\'').update({
                                name: name,
                                phone: phone,
                                address: address
                            });

                        case 29:
                            _context2.next = 31;
                            return model_girl.add({
                                k: user_key, // 题库ID
                                uid: user_id, // 发起用户ID
                                name: name, // 发起用户姓名
                                phone: phone,
                                res_json: res,
                                select_img: support_girl
                            });

                        case 31:
                            uid = _context2.sent;
                            return _context2.abrupt('return', this.success({ id: uid }));

                        case 33:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function subAction() {
            return _ref2.apply(this, arguments);
        }

        return subAction;
    }();

    // 根据用户id，uk查询用户选择的支持女生


    _class.prototype.getAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model, statistic, _get2, ud, uid, users;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            model = this.model('campagin9girl', db);
                            _context3.next = 6;
                            return model.field('select_img s,count(1) n').group('select_img').select();

                        case 6:
                            statistic = _context3.sent;
                            _get2 = this.get();
                            ud = _get2.ud;
                            uid = _get2.uid;

                            if (!(!ud && !uid)) {
                                _context3.next = 12;
                                break;
                            }

                            return _context3.abrupt('return', this.success({ u: null, s: statistic }));

                        case 12:
                            _context3.next = 14;
                            return model.field('id,name,select_img').where("k='" + ud + "' or id='" + uid + "'").select();

                        case 14:
                            users = _context3.sent;

                            if (!(users.length <= 0)) {
                                _context3.next = 17;
                                break;
                            }

                            return _context3.abrupt('return', this.success({ u: null, s: statistic }));

                        case 17:
                            users = users[0];
                            return _context3.abrupt('return', this.success({ u: users, s: statistic }));

                        case 19:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function getAction() {
            return _ref3.apply(this, arguments);
        }

        return getAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=c9g.js.map