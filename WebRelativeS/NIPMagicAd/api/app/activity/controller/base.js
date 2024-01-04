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

var Base64 = require('js-base64').Base64;

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
              allow = ['event.baca.co.id', 'localhost', 'event.cennoticias.com', 'event.festival.8jiajia.ymark.cc'];
              allowAccessOrigin = this.http.headers.origin;
              isAllow = false;

              if (think.env == 'development') isAllow = true;
              // console.log('all-1;',isAllow);

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
              // console.log('all-2;',isAllow);
              // console.log('all-2-1;',allowAccessOrigin);

              if (isAllow) {
                this.header('Access-Control-Allow-Origin', allowAccessOrigin);
              } else {
                this.header('Access-Control-Allow-Origin', 'event.baca.co.id');
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
              // console.log('all-3;',isAllow ,method);    
              // 判断

              // let ciphertext = this.cookie("token");
              // let ciphertext = this.http.headers['uk'];
              // ciphertext = Base64.decode(ciphertext || '');

              // if(isAllow && ciphertext && ciphertext != '0'){
              //   this.uk = ciphertext;
              //   // return this.fail(-99);
              //     const decryptedData = decryptCode(ciphertext);
              //     // 必须传入过期时间 和 modulename  
              //     // 事例 
              //     // {
              //     //    time -> 过期时间  [后期会被用到]
              //     // }
              //     if(decryptedData){
              //         if(!decryptedData.key){
              //           this.allow = false;
              //         }else{
              //           this.allow = true;
              //         }
              //     }
              // }else{
              //   this.allow = false;
              // }

              this.allow = isAllow;

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