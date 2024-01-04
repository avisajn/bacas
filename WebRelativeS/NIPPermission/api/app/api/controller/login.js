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

var _util = require('../../util.js');

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UID = require('node-uuid');
var DateFormat = require('dateformat');

var db = _db2.default.dbpermission;

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
                            console.log('开始请求！。。');
                            token = this.post().data;

                            if (token) {
                                _context.next = 6;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 6:
                            console.log('t1');
                            userData = (0, _util.decryptCode)(token);

                            console.log('t2', userData);

                            if (userData) {
                                _context.next = 11;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-2, '错误的数据！'));

                        case 11:
                            username = userData.username, password = userData.password;

                            console.log('t3', username, password);

                            if (!(!username || !password)) {
                                _context.next = 15;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误'));

                        case 15:
                            model = this.model('user', db);

                            console.log('t4');
                            _context.next = 19;
                            return model.field('id,username,country,roleids').where({ username: username, password: password }).select();

                        case 19:
                            users = _context.sent;

                            console.log('t5');

                            if (!(users.length <= 0)) {
                                _context.next = 23;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-2, '用户名或密码错误！'));

                        case 23:
                            console.log('t6');
                            users = users[0];
                            console.log('t7', users);
                            users.time = new Date().getTime() + 10 * 24 * 60 * 60 * 1000;

                            ciphertext = (0, _util.encryptCode)(users);

                            console.log('t8', ciphertext);
                            this.cookie("token", ciphertext, {
                                timeout: 10 * 24 * 3600 //设置 cookie 有效期为 7 天
                            });
                            return _context.abrupt('return', this.success({ id: users.id, country: users.country, rids: users.roleids, token: ciphertext }));

                        case 31:
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

    _class.prototype.outAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数错误'));

                        case 2:
                            this.cookie("token", null);
                            return _context2.abrupt('return', this.success(""));

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function outAction() {
            return _ref2.apply(this, arguments);
        }

        return outAction;
    }();

    _class.prototype.resetpwdAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, decryptedData, _old, _new, _name, model, users, userId;

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
                            // 验证旧的密码是否正确
                            param = this.post();

                            if (param.data) {
                                _context3.next = 5;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误'));

                        case 5:
                            decryptedData = (0, _util.decryptCode)(param.data);
                            _old = decryptedData.old, _new = decryptedData.new, _name = decryptedData.username;

                            if (!(!_name || !_old || !_new)) {
                                _context3.next = 9;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误'));

                        case 9:
                            model = this.model('user', db);
                            _context3.next = 12;
                            return model.field('id').where({ username: _name, password: _old }).select();

                        case 12:
                            users = _context3.sent;

                            if (!(users.length <= 0)) {
                                _context3.next = 15;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-2, '旧密码错误'));

                        case 15:
                            userId = users[0].id;
                            _context3.next = 18;
                            return model.where({ id: userId }).update({ password: _new });

                        case 18:
                            return _context3.abrupt('return', this.success('重置成功！'));

                        case 19:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function resetpwdAction() {
            return _ref3.apply(this, arguments);
        }

        return resetpwdAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=login.js.map