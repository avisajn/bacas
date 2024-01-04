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

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

var _util = require('../../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.dbhadoop;

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 登录验证
    _class.prototype.indexAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var token, userData, username, password, model, users, ciphertext;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误'));

                        case 2:
                            token = this.post().data;

                            if (token) {
                                _context.next = 5;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 5:
                            userData = (0, _util.decryptCode)(token);

                            if (userData) {
                                _context.next = 8;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-2, '错误的数据！'));

                        case 8:
                            username = userData.username, password = userData.password;

                            if (!(!username || !password)) {
                                _context.next = 11;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误'));

                        case 11:
                            model = this.model('user', db);


                            console.log('model:', model);

                            _context.next = 15;
                            return model.field('id,username').where({ username: username, password: password }).select();

                        case 15:
                            users = _context.sent;

                            if (!(users.length <= 0)) {
                                _context.next = 18;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-2, '用户名或密码错误！'));

                        case 18:
                            users = users[0];
                            users.time = new Date().getTime() + 10 * 24 * 60 * 60 * 1000;

                            ciphertext = (0, _util.encryptCode)(users);

                            this.cookie("token", ciphertext, {
                                timeout: 10 * 24 * 3600 //设置 cookie 有效期为 7 天
                            });
                            return _context.abrupt('return', this.success({ id: users.id, token: ciphertext }));

                        case 23:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function indexAction() {
            return _ref.apply(this, arguments);
        }

        return indexAction;
    }();

    // 添加一条数据


    _class.prototype.postAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, username, email, demand, time, model, id;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            param = this.post();
                            username = param.username, email = param.email, demand = param.demand, time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

                            if (!(!username || !email || !demand)) {
                                _context2.next = 4;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model = this.model('user', db);
                            _context2.next = 7;
                            return model.add({
                                username: username,
                                addtime: time,
                                email: email,
                                demand: demand,
                                status: 0
                            });

                        case 7:
                            id = _context2.sent;
                            return _context2.abrupt('return', this.success('注册成功！'));

                        case 9:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function postAction() {
            return _ref2.apply(this, arguments);
        }

        return postAction;
    }();

    _class.prototype.outAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误'));

                        case 2:
                            this.cookie("token", null);
                            return _context3.abrupt('return', this.success(""));

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function outAction() {
            return _ref3.apply(this, arguments);
        }

        return outAction;
    }();

    _class.prototype.resetpwdAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var param, decryptedData, _old, _new, _name, model, users, userId;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context4.next = 2;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数错误'));

                        case 2:
                            // 验证旧的密码是否正确
                            param = this.post();

                            if (param.data) {
                                _context4.next = 5;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数错误'));

                        case 5:
                            decryptedData = (0, _util.decryptCode)(param.data);
                            _old = decryptedData.old, _new = decryptedData.new, _name = decryptedData.username;

                            if (!(!_name || !_old || !_new)) {
                                _context4.next = 9;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数错误'));

                        case 9:
                            model = this.model('user', db);
                            _context4.next = 12;
                            return model.field('id').where({ username: _name, password: _old }).select();

                        case 12:
                            users = _context4.sent;

                            if (!(users.length <= 0)) {
                                _context4.next = 15;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-2, '旧密码错误'));

                        case 15:
                            userId = users[0].id;
                            _context4.next = 18;
                            return model.where({ id: userId }).update({ password: _new });

                        case 18:
                            return _context4.abrupt('return', this.success('重置成功！'));

                        case 19:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function resetpwdAction() {
            return _ref4.apply(this, arguments);
        }

        return resetpwdAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=login.js.map