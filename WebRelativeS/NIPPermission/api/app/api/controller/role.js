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

            var _ret, params, key, current, rowCount, where, _model, _list, count;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!this.id) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var roleId, model, list, resObj, _id;

                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                roleId = _this2.id;
                                                model = _this2.model('rolesys', db);
                                                _context.next = 4;
                                                return model.field('sysid,sysinfoid').where({ roleid: roleId }).select();

                                            case 4:
                                                list = _context.sent;
                                                resObj = {};
                                                _id = null;

                                                list.map(function (k) {
                                                    _id = k.sysid;
                                                    if (!resObj[_id]) {
                                                        resObj[_id] = [];
                                                    }
                                                    resObj[_id].push(k.sysinfoid + "");
                                                });
                                                return _context.abrupt('return', {
                                                    v: _this2.success(resObj)
                                                });

                                            case 9:
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
                            params = this.get() || {}, key = params.key, current = params.current || 1, rowCount = params.rowCount || 40;
                            where = {};
                            // let where = {'adduser': this.getUserId() }

                            if (key) {
                                where['name'] = ['like', '%' + key + '%'];
                            }

                            _model = this.model('role', db);
                            _context2.next = 13;
                            return _model.field('id,name,desc').page(current, rowCount).where(where).select();

                        case 13:
                            _list = _context2.sent;
                            _context2.next = 16;
                            return _model.where(where).count('id');

                        case 16:
                            count = _context2.sent;
                            return _context2.abrupt('return', this.success({
                                "current": current,
                                "rowCount": rowCount,
                                "rows": _list,
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
            var param, name, time, model;
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
                            model = this.model('role', db);
                            _context3.next = 7;
                            return model.add({
                                name: name,
                                desc: param.desc || ''
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
            var param, id, name, model, insertId;
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
                            model = this.model('role', db);
                            _context4.next = 9;
                            return model.where({ id: id }).update({
                                name: name,
                                desc: param.desc || ''
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
            var uid, model;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            uid = this.id;

                            if (uid) {
                                _context5.next = 3;
                                break;
                            }

                            return _context5.abrupt('return', this.fail('id为空！'));

                        case 3:
                            model = this.model('role', db);
                            _context5.next = 6;
                            return model.delete({ where: { id: uid } });

                        case 6:
                            return _context5.abrupt('return', this.success('删除成功！'));

                        case 7:
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
//# sourceMappingURL=role.js.map