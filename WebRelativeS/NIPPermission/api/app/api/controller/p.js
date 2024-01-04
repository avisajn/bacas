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
            var sysId, rids, model, list, user;
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
                            sysId = this.get().sysid;
                            rids = this.getRids();
                            model = this.model('rolesys', db);
                            _context.next = 7;
                            return model.field('si.`key`,si.type').alias('base').join(['sys s on s.id=base.sysid ', 'sysinfo si on si.id=base.sysinfoid']).where('roleid in (' + rids + ') and base.sysid=' + sysId).select();

                        case 7:
                            list = _context.sent;
                            user = this.getUser();
                            return _context.abrupt('return', this.success({
                                list: list,
                                country: user.country,
                                username: user.username
                            }));

                        case 10:
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

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=p.js.map