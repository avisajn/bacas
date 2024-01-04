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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var userid, rids, model, list, params, key, current, rowCount, where, _model, _list, count;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!this.id) {
                                _context2.next = 10;
                                break;
                            }

                            userid = this.id;
                            rids = this.get().rids;
                            model = this.model('rolesys', db);
                            _context2.next = 6;
                            return model.field('s.`name` sysname ,s.testurl ,s.url,s.id sysid,si.`key` ,si.type,si.`desc`').alias('base').join(['sys s on s.id=base.sysid', 'sysinfo si on si.id=base.sysinfoid']).where('roleid in (' + rids + ')').select();

                        case 6:
                            list = _context2.sent;
                            return _context2.abrupt('return', this.success(list));

                        case 10:
                            params = this.get() || {}, key = params.key, current = params.current || 1, rowCount = params.rowCount || 30;
                            where = {};
                            // let where = {'adduser': this.getUserId() }

                            if (key) {
                                where['username'] = ['like', '%' + key + '%'];
                            }

                            _model = this.model('user', db);
                            _context2.next = 16;
                            return _model.field('id,country,username,roleids,addtime').alias('base').page(current, rowCount).where(where).select();

                        case 16:
                            _list = _context2.sent;

                            if (!(_list.length > 0)) {
                                _context2.next = 19;
                                break;
                            }

                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var roleids, model_role, _allroles, allroles, _ids, _names;

                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                roleids = [];

                                                _list.map(function (k) {
                                                    roleids.push(k.roleids);
                                                });
                                                model_role = _this2.model('role', db);
                                                _context.next = 5;
                                                return model_role.field('id ,name').where("id in (" + roleids + ")").select();

                                            case 5:
                                                _allroles = _context.sent;
                                                allroles = {};

                                                _allroles.map(function (k) {
                                                    allroles[k.id] = k.name;
                                                });
                                                _ids = null;
                                                _names = null;

                                                _list.map(function (k) {
                                                    _ids = k.roleids + "";
                                                    if (_ids.indexOf(',') > 0) {
                                                        _ids = _ids.split(',');
                                                        k.roleids = _ids;
                                                        _names = [];
                                                        for (var i = 0; i < _ids.length; i++) {
                                                            _names.push(allroles[_ids[i]]);
                                                        }
                                                        k.rolesname = _names;
                                                    } else {
                                                        k.rolesname = [allroles[_ids]];
                                                        k.roleids = [_ids];
                                                    }
                                                });

                                            case 11:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this2);
                            })(), 't0', 19);

                        case 19:
                            _context2.next = 21;
                            return _model.where(where).count('id');

                        case 21:
                            count = _context2.sent;
                            return _context2.abrupt('return', this.success({
                                "current": current,
                                "rowCount": rowCount,
                                "rows": _list,
                                "total": count
                            }));

                        case 23:
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
            var param, username, password, roleids, country, time, model;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            param = this.post();

                            console.log('param:', param);
                            username = param.username, password = param.password, roleids = param.roles, country = param.country, time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

                            if (!(!username || !password || !roleids)) {
                                _context3.next = 5;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数不正确'));

                        case 5:
                            model = this.model('user', db);
                            _context3.next = 8;
                            return model.add({
                                username: username,
                                password: password,
                                roleids: roleids || '-',
                                country: country,
                                addtime: time,
                                status: 0
                            });

                        case 8:
                            return _context3.abrupt('return', this.success('添加成功！'));

                        case 9:
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
            var param, id, username, country, roleids, model, insertId;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (this.id) {
                                _context4.next = 2;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, 'id为空！'));

                        case 2:
                            // {"id":19,"username":"raquel","password":"c6b49056b770f629f4acaecb61cbe609","roles":"8,11,6,4","country":"id"}
                            console.log('1:');
                            param = this.post();
                            id = param.id, username = param.username, country = param.country, roleids = param.roles;

                            console.log('2:');

                            if (!(!username || !roleids)) {
                                _context4.next = 8;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数不正确'));

                        case 8:
                            console.log('3:');

                            //  select username,roleids,country from user where id=19;
                            //  select * from user where id=19;
                            //  update user set roleids='8,11,6,4,5',country='id' where id=19;
                            model = this.model('user', db);
                            _context4.next = 12;
                            return model.where({ id: id }).update({
                                username: username,
                                roleids: roleids,
                                country: country
                            });

                        case 12:
                            insertId = _context4.sent;

                            console.log('insertId:', insertId);
                            return _context4.abrupt('return', this.success('修改成功'));

                        case 15:
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
                            model = this.model('user', db);
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
//# sourceMappingURL=user.js.map