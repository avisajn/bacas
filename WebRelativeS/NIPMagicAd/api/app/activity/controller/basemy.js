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

var _class = function (_think$controller$bas) {
  (0, _inherits3.default)(_class, _think$controller$bas);

  function _class() {
    (0, _classCallCheck3.default)(this, _class);
    return (0, _possibleConstructorReturn3.default)(this, _think$controller$bas.apply(this, arguments));
  }

  /**
   * some base method in here
   */
  _class.prototype.__before = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var allow, _http$headers, _http$headers$origin, origin, _http$headers$uk, uk, isAllow, i, len;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              allow = ['ymark.cc', 'localhost', 'liaoshane.com'];
              _http$headers = this.http.headers;
              _http$headers$origin = _http$headers.origin;
              origin = _http$headers$origin === undefined ? '' : _http$headers$origin;
              _http$headers$uk = _http$headers.uk;
              uk = _http$headers$uk === undefined ? '' : _http$headers$uk;


              this.ip = this.http.ip();

              isAllow = false;

              if (think.env == 'development' || uk == 'wx_xiaochengxu') isAllow = true;

              i = 0, len = allow.length;

            case 10:
              if (!(i < len)) {
                _context.next = 17;
                break;
              }

              if (!isAllow) {
                _context.next = 13;
                break;
              }

              return _context.abrupt('break', 17);

            case 13:
              if (origin && origin.indexOf(allow[i]) >= 0) isAllow = true;

            case 14:
              i++;
              _context.next = 10;
              break;

            case 17:

              if (isAllow) {
                this.header('Access-Control-Allow-Origin', origin);
              } else {
                this.header('Access-Control-Allow-Origin', 'ywordle.ymark.cc');
              }
              // this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With ,enctype ,location');
              this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,enctype ,location ,document,uk');
              this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
              this.header('Access-Control-Allow-Credentials', 'true');
              this.allow = isAllow;

              if (!(this.http.method == "OPTIONS")) {
                _context.next = 25;
                break;
              }

              this.end();
              return _context.abrupt('return');

            case 25:
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

  return _class;
}(think.controller.base);

exports.default = _class;
//# sourceMappingURL=basemy.js.map