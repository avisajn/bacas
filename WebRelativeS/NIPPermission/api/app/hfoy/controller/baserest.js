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

var _util = require('../../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_think$controller$res) {
  (0, _inherits3.default)(_class, _think$controller$res);

  function _class() {
    (0, _classCallCheck3.default)(this, _class);
    return (0, _possibleConstructorReturn3.default)(this, _think$controller$res.apply(this, arguments));
  }

  /**
   * some base method in here
   */
  _class.prototype.__before = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var allow, allowAccessOrigin, isAllow, i, len, token, decryptedData, _userInfo;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              allow = ['hatech', 'localhost', 'hadoopfinetech'];
              allowAccessOrigin = this.http.headers.origin;
              isAllow = false;

              if (think.env == 'development') isAllow = true;

              i = 0, len = allow.length;

            case 5:
              if (!(i < len)) {
                _context.next = 12;
                break;
              }

              if (!isAllow) {
                _context.next = 8;
                break;
              }

              return _context.abrupt('break', 12);

            case 8:
              if (allowAccessOrigin && allowAccessOrigin.indexOf(allow[i]) >= 0) isAllow = true;

            case 9:
              i++;
              _context.next = 5;
              break;

            case 12:

              if (isAllow) {
                this.header('Access-Control-Allow-Origin', allowAccessOrigin);
              } else {
                this.header('Access-Control-Allow-Origin', 'ywordle.ymark.cc');
              }
              this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
              this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
              this.header('Access-Control-Allow-Credentials', 'true');

              if (!(this.http.method.toLowerCase() === "options")) {
                _context.next = 19;
                break;
              }

              this.end();
              return _context.abrupt('return', this.fail(-1));

            case 19:
              token = this.cookie("token");

              if (!(!token || token == '0')) {
                _context.next = 22;
                break;
              }

              return _context.abrupt('return', this.fail(-99));

            case 22:
              decryptedData = (0, _util.decryptCode)(token);

              if (!(!decryptedData || !decryptedData.id || !decryptedData.username)) {
                _context.next = 25;
                break;
              }

              return _context.abrupt('return', this.fail(-99));

            case 25:
              if (!(new Date().getTime() >= decryptedData.time)) {
                _context.next = 27;
                break;
              }

              return _context.abrupt('return', this.fail(-98));

            case 27:
              _userInfo = decryptedData;


              this.getUser = function () {
                return _userInfo;
              };

              this.getUserId = function () {
                return _userInfo.id;
              };

            case 30:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function __before() {
      return _ref.apply(this, arguments);
    }

    return __before;
  }();

  _class.prototype.__call = function __call() {
    return this.fail(think.locale("ACTION_INVALID", this.http.action, this.http.url));
  };

  return _class;
}(think.controller.rest);

exports.default = _class;
//# sourceMappingURL=baserest.js.map