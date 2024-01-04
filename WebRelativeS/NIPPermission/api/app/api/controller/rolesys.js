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
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
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


    _class.prototype.setrolesysAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, addList, removeList, data, roleid, _loop, sysid, model;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return', "");

                        case 2:
                            // 需要sysid, sysinfoid, roleid
                            param = this.post();

                            if (!(!param.data || !param.roleid)) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数错误'));

                        case 5:
                            addList = [];
                            removeList = [];
                            data = param.data;
                            roleid = param.roleid;

                            _loop = function _loop(sysid) {
                                if (data[sysid].length > 0) {
                                    data[sysid].map(function (k) {
                                        addList.push({ roleid: roleid, sysid: sysid, sysinfoid: k });
                                    });
                                } else {
                                    removeList.push(sysid);
                                }
                            };

                            for (sysid in data) {
                                _loop(sysid);
                            }
                            model = this.model('rolesys', db);

                            if (!(addList.length > 0)) {
                                _context2.next = 17;
                                break;
                            }

                            _context2.next = 15;
                            return model.addMany(addList, {}, true);

                        case 15:
                            _context2.next = 17;
                            return model.execute('delete from rolesys where id not in (select * from (select min(id) as id from rolesys group by roleid,sysid,sysinfoid) as tmp)');

                        case 17:
                            if (!(removeList.length > 0)) {
                                _context2.next = 20;
                                break;
                            }

                            _context2.next = 20;
                            return model.delete({ where: { sysid: ["IN", removeList.join(',')], roleid: roleid } });

                        case 20:
                            return _context2.abrupt('return', this.success('添加成功！'));

                        case 21:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function setrolesysAction() {
            return _ref2.apply(this, arguments);
        }

        return setrolesysAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=rolesys.js.map