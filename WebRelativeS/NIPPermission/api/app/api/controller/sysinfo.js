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

var _baserest = require('./baserest.js');

var _baserest2 = _interopRequireDefault(_baserest);

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

    _class.prototype.getAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var params, id, model, list;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.id) {
                                _context.next = 4;
                                break;
                            }

                            return _context.abrupt('return', this.success('data'));

                        case 4:
                            params = this.get() || {}, id = params.sysid;

                            if (id) {
                                _context.next = 7;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误：sysid为空！'));

                        case 7:
                            model = this.model('sysinfo', db);
                            _context.next = 10;
                            return model.where({ sysid: id }).select();

                        case 10:
                            list = _context.sent;
                            return _context.abrupt('return', this.success(list));

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getAction() {
            return _ref.apply(this, arguments);
        }

        return getAction;
    }();

    // 添加一条数据


    _class.prototype.postAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, sysid, key, model_sysinfo;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            param = this.post();
                            sysid = param.sysid, key = param.key;

                            if (!(!sysid || !key)) {
                                _context2.next = 4;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model_sysinfo = this.model('sysinfo', db);
                            _context2.next = 7;
                            return model_sysinfo.add({
                                sysid: sysid,
                                type: param.type || 1,
                                key: param.key || '',
                                desc: param.desc || ''
                            });

                        case 7:
                            return _context2.abrupt('return', this.success('添加成功！'));

                        case 8:
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

    // 修改一条数据


    _class.prototype.putAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, id, key, sysid, model_sysinfo, insertId;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (this.id) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', this.fail('id为空！'));

                        case 2:
                            param = this.post();
                            id = param.id, key = param.key, sysid = param.sysid;

                            if (!(!key || !sysid)) {
                                _context3.next = 6;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数不正确'));

                        case 6:
                            model_sysinfo = this.model('sysinfo', db);
                            _context3.next = 9;
                            return model_sysinfo.where({ sysid: sysid, id: id }).update({
                                key: param.key || '',
                                type: param.type || 1,
                                desc: param.desc || ''
                            });

                        case 9:
                            insertId = _context3.sent;
                            return _context3.abrupt('return', this.success('修改成功'));

                        case 11:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function putAction() {
            return _ref3.apply(this, arguments);
        }

        return putAction;
    }();

    _class.prototype.deleteAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', this.success('删除成功！'));

                        case 1:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function deleteAction() {
            return _ref4.apply(this, arguments);
        }

        return deleteAction;
    }();

    return _class;
}(_baserest2.default);

exports.default = _class;
//# sourceMappingURL=sysinfo.js.map