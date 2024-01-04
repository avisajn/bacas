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

    // 返回所有的发布人
    _class.prototype.createAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var param, userid, model, id;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            model = this.model('valentine', db);
                            _context.next = 8;
                            return model.add({ userid: userid, w1: 0, w2: 0, w3: 0, w4: 0 });

                        case 8:
                            id = _context.sent;

                            if (!id) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', this.success(id));

                        case 13:
                            return _context.abrupt('return', this.fail(-1, id));

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function createAction() {
            return _ref.apply(this, arguments);
        }

        return createAction;
    }();

    _class.prototype.setAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, userid, type, status, model, obj, id;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            model = this.model('valentine', db);
                            obj = {};

                            obj['w' + type] = status;
                            if (status == 0) {
                                obj['w' + type + '_time'] = '';
                            } else {
                                obj['w' + type + '_time'] = (0, _moment2.default)().format('YYYY-MM-DD HH:mm:ss');
                            }
                            _context2.next = 11;
                            return model.where({ userid: userid }).update(obj);

                        case 11:
                            id = _context2.sent;

                            if (!id) {
                                _context2.next = 16;
                                break;
                            }

                            return _context2.abrupt('return', this.success(id));

                        case 16:
                            return _context2.abrupt('return', this.fail(-1, id));

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function setAction() {
            return _ref2.apply(this, arguments);
        }

        return setAction;
    }();

    _class.prototype.getAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var params, userid, model, res;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            res = _context3.sent;

                            if (!(res.length > 0)) {
                                _context3.next = 8;
                                break;
                            }

                            return _context3.abrupt('return', this.success(res[0]));

                        case 8:
                            return _context3.abrupt('return', this.fail(-1));

                        case 9:
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

    _class.prototype.getlistAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var model, res;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            res = _context4.sent;
                            return _context4.abrupt('return', this.success(res));

                        case 6:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function getlistAction() {
            return _ref4.apply(this, arguments);
        }

        return getlistAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=valentine.js.map