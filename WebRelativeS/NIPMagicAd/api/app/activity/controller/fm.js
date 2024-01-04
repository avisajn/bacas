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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.activity;

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 设置中奖
    _class.prototype.setprizeAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _post, ids, prize_name, model_film_user, res;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 6:
                            model_film_user = this.model('campagin9girl', db); //prizename='123'

                            _context.next = 9;
                            return model_film_user.where('id in (' + ids + ')').update({ prizename: prize_name });

                        case 9:
                            res = _context.sent;
                            return _context.abrupt('return', this.success({ num: res, res: '设置成功！' }));

                        case 11:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function setprizeAction() {
            return _ref.apply(this, arguments);
        }

        return setprizeAction;
    }();

    // 设置中奖


    _class.prototype.removeAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _post2, ids, model_film_user, res;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            model_film_user = this.model('campagin9girl', db); //prizename='123'

                            console.log('ids:', ids);
                            _context2.next = 9;
                            return model_film_user.delete({ where: { id: ['IN', ids] } });

                        case 9:
                            res = _context2.sent;
                            return _context2.abrupt('return', this.success({ num: res, res: '删除成功！' }));

                        case 11:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function removeAction() {
            return _ref2.apply(this, arguments);
        }

        return removeAction;
    }();

    // 获取已经中奖的用户


    _class.prototype.queryprizeAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model_film_prize, userList;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            userList = _context3.sent;

                            if (!(userList.length <= 0)) {
                                _context3.next = 7;
                                break;
                            }

                            return _context3.abrupt('return', this.success([]));

                        case 7:
                            userList.map(function (k) {
                                try {
                                    (function () {
                                        var res = JSON.parse(k.res);
                                        var _al = {};
                                        res.map(function (j) {
                                            _al['_' + j.k] = j.v[0];
                                        });
                                        k.res = _al;
                                    })();
                                } catch (e) {
                                    k.res = {};
                                }
                            });
                            return _context3.abrupt('return', this.success(userList));

                        case 9:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function queryprizeAction() {
            return _ref3.apply(this, arguments);
        }

        return queryprizeAction;
    }();

    // 查询用户列表 - 一口气返回所有的


    _class.prototype.queryuserAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var model_film_standing, list;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            list = _context4.sent;

                            if (!(list.length <= 0)) {
                                _context4.next = 7;
                                break;
                            }

                            return _context4.abrupt('return', this.success([]));

                        case 7:
                            list.map(function (k) {
                                try {
                                    (function () {
                                        var res = JSON.parse(k.res);
                                        var _al = {};
                                        res.map(function (j) {
                                            _al['_' + j.k] = j.v[0];
                                        });
                                        k.res = _al;
                                    })();
                                } catch (e) {
                                    k.res = {};
                                }
                            });
                            return _context4.abrupt('return', this.success(list));

                        case 9:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function queryuserAction() {
            return _ref4.apply(this, arguments);
        }

        return queryuserAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=fm.js.map