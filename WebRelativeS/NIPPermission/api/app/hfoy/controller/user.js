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

var _basenone = require('./basenone.js');

var _basenone2 = _interopRequireDefault(_basenone);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

var _blueimpMd = require('blueimp-md5');

var _blueimpMd2 = _interopRequireDefault(_blueimpMd);

var _util = require('../../util.js');

var _api = require('../../api.js');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateFormat = require('dateformat');

var db = _db2.default.dbhadoop;

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 添加一条数据
    _class.prototype.regAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var param, username, demand, pwd, time, email, userInfo, model, user_id;
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
                            param = this.post();
                            username = param.username, demand = param.demand, pwd = param.t, time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
                            email = param.email || '-';

                            if (!(!username || !email)) {
                                _context.next = 7;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数不正确'));

                        case 7:

                            if (pwd) pwd = (0, _blueimpMd2.default)(pwd);else pwd = '-';

                            // console.log(pwd);
                            // return this.success('添加成功！');
                            // 这里获取新的userid
                            _context.next = 10;
                            return _api2.default.getUserId();

                        case 10:
                            userInfo = _context.sent;

                            if (!(userInfo.status != 'ok')) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '获取用户ID出错了！'));

                        case 13:
                            ;

                            model = this.model('user', db);
                            _context.next = 17;
                            return model.add({
                                id: userInfo.account_id,
                                username: username || '-',
                                password: pwd || '-',
                                addtime: time,
                                email: email || '-',
                                demand: demand || '-',
                                status: 0,
                                apikey: userInfo.api_key
                            });

                        case 17:
                            user_id = _context.sent;
                            return _context.abrupt('return', this.success({ user_id: user_id, msg: '提交成功！' }));

                        case 19:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function regAction() {
            return _ref.apply(this, arguments);
        }

        return regAction;
    }();

    _class.prototype.getAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var model, data;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            model = this.model('user', db);
                            _context2.next = 3;
                            return model.order('id desc').field('apikey,demand,username,email').select();

                        case 3:
                            data = _context2.sent;
                            return _context2.abrupt('return', this.success(data));

                        case 5:
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

    _class.prototype.gettokenAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, id, ciphertext;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            // 输入一个 id 和 email ，然后生成一个 email地址
                            param = this.get();
                            id = param.id;

                            if (id) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            ciphertext = (0, _util.encryptCode)({
                                time: new Date().getTime() + 1 * 60 * 60 * 1000,
                                id: id
                            });
                            return _context3.abrupt('return', this.success('?t=' + ciphertext));

                        case 6:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function gettokenAction() {
            return _ref3.apply(this, arguments);
        }

        return gettokenAction;
    }();

    // 添加一条数据


    _class.prototype.postAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var param, username, email, demand, time, model;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            param = this.post();
                            username = param.username, email = param.email, demand = param.demand, time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

                            if (!(!username || !email || !demand)) {
                                _context4.next = 4;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model = this.model('user', db);
                            _context4.next = 7;
                            return model.add({
                                username: username,
                                // password : password,
                                addtime: time,
                                email: email,
                                demand: demand,
                                status: 0
                            });

                        case 7:
                            return _context4.abrupt('return', this.success('添加成功！'));

                        case 8:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function postAction() {
            return _ref4.apply(this, arguments);
        }

        return postAction;
    }();

    // 修改一条数据


    _class.prototype.putAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var param, id, username, email, demand, model, insertId;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            if (this.id) {
                                _context5.next = 2;
                                break;
                            }

                            return _context5.abrupt('return', this.fail('id为空！'));

                        case 2:
                            param = this.post();
                            id = param.id, username = param.username, email = param.email, demand = param.demand;

                            if (!(!username || !email || !demand)) {
                                _context5.next = 6;
                                break;
                            }

                            return _context5.abrupt('return', this.fail(-1, '参数不正确'));

                        case 6:
                            model = this.model('user', db);
                            _context5.next = 9;
                            return model.where({ id: id }).update({
                                username: username,
                                email: email,
                                demand: demand
                            });

                        case 9:
                            insertId = _context5.sent;
                            return _context5.abrupt('return', this.success('修改成功'));

                        case 11:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function putAction() {
            return _ref5.apply(this, arguments);
        }

        return putAction;
    }();

    _class.prototype.setpwdAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
            var param, decryptedData, _old, _new, _id, model;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context6.next = 2;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-1, '参数错误'));

                        case 2:
                            // 验证旧的密码是否正确
                            param = this.post();

                            if (param.data) {
                                _context6.next = 5;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-1, '参数错误'));

                        case 5:
                            decryptedData = (0, _util.decryptCode)(param.data);
                            _old = decryptedData.old, _new = decryptedData.new, _id = decryptedData.id;

                            if (!(!_id || !_old || !_new)) {
                                _context6.next = 9;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-1, '参数错误'));

                        case 9:
                            model = this.model('user', db);
                            _context6.next = 12;
                            return model.where({ id: _id }).update({ password: _new, status: 1 });

                        case 12:
                            return _context6.abrupt('return', this.success('重置成功！'));

                        case 13:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function setpwdAction() {
            return _ref6.apply(this, arguments);
        }

        return setpwdAction;
    }();

    return _class;
}(_basenone2.default);

exports.default = _class;
//# sourceMappingURL=user.js.map