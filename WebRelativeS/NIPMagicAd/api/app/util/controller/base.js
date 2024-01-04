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
      var allowAccessOrigin, _userInfo;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              allowAccessOrigin = this.http.headers.origin;


              this.header('Access-Control-Allow-Origin', allowAccessOrigin);
              this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
              this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
              this.header('Access-Control-Allow-Credentials', 'true');

              // return ;
              // let ciphertext = this.cookie("token");

              // if(!ciphertext){
              // return this.fail(-2, '未登录！');
              // }

              // 解密
              // let bytes  = CryptoJS.AES.decrypt(ciphertext, crypKey);
              // let _userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
              _userInfo = { userid: 1 };

              if (!(!_userInfo || !_userInfo.userid)) {
                _context.next = 8;
                break;
              }

              return _context.abrupt('return', this.fail(-2, '登录信息不正确！'));

            case 8:

              this.getUser = function () {
                return _userInfo;
              };

              this.getUserId = function () {
                return _userInfo.userid;
              };

              if (think.env == 'development') {
                this.STATICURL = '';
              } else {
                this.STATICURL = 'http://static.ymark.wang';
              }

            case 11:
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