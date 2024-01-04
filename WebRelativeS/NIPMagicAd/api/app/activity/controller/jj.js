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

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 提交信息
    _class.prototype.subAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _post, name, phone, res, type, myreg, model_user, num, new_id;

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
                            name = _post.name;
                            phone = _post.phone;
                            res = _post.res;
                            type = _post.type;

                            if (!(!name || !phone || !type || !res)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 9:
                            myreg = /^1\d{10}$/;

                            if (myreg.test(phone)) {
                                _context.next = 12;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '手机号错误！'));

                        case 12:
                            model_user = this.model('jiajia_user', db);
                            _context.next = 15;
                            return model_user.where('phone=\'' + phone + '\'').select();

                        case 15:
                            num = _context.sent;

                            if (!(num.length > 0)) {
                                _context.next = 18;
                                break;
                            }

                            return _context.abrupt('return', this.success({ id: num[0].id, err: '重复添加' }));

                        case 18:
                            _context.next = 20;
                            return model_user.add({
                                name: name, // 发起用户姓名
                                phone: phone,
                                res: res,
                                type: type
                            });

                        case 20:
                            new_id = _context.sent;
                            return _context.abrupt('return', this.success({ id: new_id }));

                        case 22:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function subAction() {
            return _ref.apply(this, arguments);
        }

        return subAction;
    }();

    // 提交信息


    _class.prototype.getAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _get, phone, myreg, model_user, num, user;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(!this.allow || this.method != 'get')) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            _get = this.get();
                            phone = _get.phone;

                            if (phone) {
                                _context2.next = 6;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数错误！'));

                        case 6:
                            myreg = /^1\d{10}$/;

                            if (myreg.test(phone)) {
                                _context2.next = 9;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '手机号错误！'));

                        case 9:
                            model_user = this.model('jiajia_user', db);
                            _context2.next = 12;
                            return model_user.where('phone=\'' + phone + '\'').select();

                        case 12:
                            num = _context2.sent;

                            if (!(num.length <= 0)) {
                                _context2.next = 15;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-2, '找不到！'));

                        case 15:
                            user = num[0];

                            user.phone = user.phone.substring(0, 3) + ' **** ' + user.phone.substring(user.phone.length - 4);
                            return _context2.abrupt('return', this.success({ name: user.name, phone: user.phone, type: user.type }));

                        case 18:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getAction() {
            return _ref2.apply(this, arguments);
        }

        return getAction;
    }();

    _class.prototype.countAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model_user, old_num, new_num;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            model_user = this.model('jiajia_user', db);
                            _context3.next = 3;
                            return model_user.field('id').where('type=1').select();

                        case 3:
                            old_num = _context3.sent;

                            old_num = old_num.length;
                            _context3.next = 7;
                            return model_user.field('id').where('type=2').select();

                        case 7:
                            new_num = _context3.sent;

                            new_num = new_num.length;
                            return _context3.abrupt('return', this.success('一共有' + (new_num + old_num) + '个用户参加，其中' + new_num + '个是新用户，' + old_num + '个是老用户'));

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function countAction() {
            return _ref3.apply(this, arguments);
        }

        return countAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=jj.js.map