'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var _ret, params, key, current, rowCount, where, _model, list, count;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(this.id && this.id == 'all')) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var model, model_info, syslist, infolist, infoObj, _id, newList;

                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                // 获取所有系统，及系统的所有权限
                                                model = _this2.model('sys', db);
                                                model_info = _this2.model('sysinfo', db);
                                                _context.next = 4;
                                                return model.field('id,name').select();

                                            case 4:
                                                syslist = _context.sent;
                                                _context.next = 7;
                                                return model_info.select();

                                            case 7:
                                                infolist = _context.sent;
                                                infoObj = {};
                                                _id = null;
                                                newList = [];

                                                infolist.map(function (k) {
                                                    _id = k.sysid;
                                                    if (!infoObj[_id]) {
                                                        infoObj[_id] = [];
                                                    }
                                                    if (k.type == 1) {
                                                        k.type = '页面';
                                                    } else {
                                                        k.type = '功能';
                                                    }
                                                    infoObj[_id].push({
                                                        label: k.type,
                                                        key: k.id + "",
                                                        name: k.key,
                                                        desc: k.desc
                                                    });
                                                });
                                                return _context.abrupt('return', {
                                                    v: _this2.success({ sys: syslist, info: infoObj })
                                                });

                                            case 13:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this2);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context2.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', _ret.v);

                        case 5:
                            _context2.next = 18;
                            break;

                        case 7:
                            params = this.get() || {}, key = params.key, current = params.current || 1, rowCount = params.rowCount || 30;
                            where = {};
                            // let where = {'adduser': this.getUserId() }

                            if (key) {
                                where['name'] = ['like', '%' + key + '%'];
                            }

                            _model = this.model('sys', db);
                            _context2.next = 13;
                            return _model.field('id,name,testurl,url').page(current, rowCount).where(where).select();

                        case 13:
                            list = _context2.sent;
                            _context2.next = 16;
                            return _model.where(where).count('id');

                        case 16:
                            count = _context2.sent;
                            return _context2.abrupt('return', this.success({
                                "current": current,
                                "rowCount": rowCount,
                                "rows": list,
                                "total": count
                            }));

                        case 18:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getAction() {
            return _ref.apply(this, arguments);
        }

        return getAction;
    }();

    // 添加一条数据


    _class.prototype.postAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, name, time, model_sys;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            param = this.post();
                            name = param.name, time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

                            if (name) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model_sys = this.model('sys', db);
                            _context3.next = 7;
                            return model_sys.add({
                                name: name,
                                testurl: param.testurl || '',
                                url: param.url || '',
                                status: 0
                            });

                        case 7:
                            return _context3.abrupt('return', this.success('添加成功！'));

                        case 8:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function postAction() {
            return _ref2.apply(this, arguments);
        }

        return postAction;
    }();

    // 修改一条数据


    _class.prototype.putAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var param, id, name, model_sys, insertId;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (this.id) {
                                _context4.next = 2;
                                break;
                            }

                            return _context4.abrupt('return', this.fail('id为空！'));

                        case 2:
                            param = this.post();
                            id = param.id, name = param.name;

                            if (name) {
                                _context4.next = 6;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数不正确'));

                        case 6:
                            model_sys = this.model('sys', db);
                            _context4.next = 9;
                            return model_sys.where({ id: id }).update({
                                name: name,
                                testurl: param.testurl || '',
                                url: param.url || ''
                            });

                        case 9:
                            insertId = _context4.sent;
                            return _context4.abrupt('return', this.success('修改成功'));

                        case 11:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function putAction() {
            return _ref3.apply(this, arguments);
        }

        return putAction;
    }();

    _class.prototype.deleteAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            return _context5.abrupt('return', this.success('删除成功！'));

                        case 1:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function deleteAction() {
            return _ref4.apply(this, arguments);
        }

        return deleteAction;
    }();

    return _class;
}(_baserest2.default);

exports.default = _class;
//# sourceMappingURL=sys.js.map