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
      var allow, allowAccessOrigin, isAllow, i, len, method;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              allow = ['localhost', 'ymark.cc', 'www.shejiye.com', 'yeelogo.com', 'yciyun.com'];
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
                this.header('Access-Control-Allow-Origin', 'ymark.cc');
              }
              this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept ,X-Requested-With,uk,enctype,document,location');
              this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
              this.header('Access-Control-Allow-Credentials', 'true');
              method = this.http.method.toLocaleLowerCase();

              this.method = method;

              if (!(method == "options")) {
                _context.next = 22;
                break;
              }

              this.allow = false;
              this.end();
              return _context.abrupt('return');

            case 22:
              this.allow = isAllow;

              // let ciphertext = this.cookie("token");
              // if(!ciphertext || ciphertext == '0'){
              //   return this.fail(-99);
              // }


              // const platform = {
              //   'app.ios'       : true,
              //   'app.android'   : true,
              //   'web'           : true,
              // }

              // const decryptedData = decryptCode(ciphertext);
              // // 必须传入过期时间 和 modulename  
              // // 事例 
              // // {
              // //    time -> 过期时间  [后期会被用到]
              // //    platform -> 平台 [app.ios | app.android]
              // // }
              // if(!decryptedData || !decryptedData.platform || !platform[decryptedData.platform]){
              //   return this.fail(-99);
              // }

              // if(new Date().getTime() >= decryptedData.time){
              //   return this.fail(-98);
              // }
              // let _userInfo = decryptedData;
              // this.getUser = function(){
              //   return _userInfo;
              // }

              // this.getRids = function(){
              //   return _userInfo.roleids;
              // }

              // this.getUserId = function(){
              //     return _userInfo.id;
              // }

            case 23:
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