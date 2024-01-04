'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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
      var _this2 = this;

      var allowAccessOrigin, _ret;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              allowAccessOrigin = this.http.headers.origin;

              this.header('Access-Control-Allow-Origin', allowAccessOrigin);
              this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
              this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
              this.header('Access-Control-Allow-Credentials', 'true');

              if (!(this.http.method == "OPTIONS")) {
                _context.next = 8;
                break;
              }

              this.end();
              return _context.abrupt('return');

            case 8:
              if (!(this.http.url != '/api/login/')) {
                _context.next = 12;
                break;
              }

              _ret = function () {
                var ciphertext = _this2.cookie("token");
                if (!ciphertext || ciphertext == '0') {
                  return {
                    v: _this2.fail(-99)
                  };
                }

                var decryptedData = (0, _util.decryptCode)(ciphertext);
                if (!decryptedData || !decryptedData.id || !decryptedData.username || !decryptedData.roleids) {
                  return {
                    v: _this2.fail(-99)
                  };
                }
                if (new Date().getTime() >= decryptedData.time) {
                  return {
                    v: _this2.fail(-98)
                  };
                }
                var _userInfo = decryptedData;
                _this2.getUser = function () {
                  return _userInfo;
                };

                _this2.getRids = function () {
                  return _userInfo.roleids;
                };

                _this2.getUserId = function () {
                  return _userInfo.id;
                };
              }();

              if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                _context.next = 12;
                break;
              }

              return _context.abrupt('return', _ret.v);

            case 12:
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
//# sourceMappingURL=base.js.map