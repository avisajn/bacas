'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var db = _db2.default.dbmh;

var _class = function (_Base) {
  (0, _inherits3.default)(_class, _Base);

  function _class() {
    (0, _classCallCheck3.default)(this, _class);
    return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
  }

  /**
   * index action
   * @return {Promise} []
   */
  _class.prototype.indexAction = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var params, current, model_mh, list, newList;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              params = this.get() || {}, current = params.current || 1;
              model_mh = this.model('pmmh', db);
              _context.next = 4;
              return model_mh.field('content,img,title').page(current, 10).select();

            case 4:
              list = _context.sent;
              newList = [];

              list.map(function (k) {
                // newList.push(JSON.parse());
                if (k.content && k.content != 'undefined') {
                  newList.push(JSON.parse(k.content));
                } else {
                  newList.push({});
                }
              });
              this.dataJson = (0, _stringify2.default)(newList);
              this.dataList = list;
              return _context.abrupt('return', this.display('index'));

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

  _class.prototype.imgAction = function imgAction() {
    return this.display('img');
  };

  _class.prototype.infoAction = function infoAction() {
    return this.display('info');
  };

  return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=mh.js.map