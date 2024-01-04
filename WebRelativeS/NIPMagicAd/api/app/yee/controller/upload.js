'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _util = require('../../util.js');

var _ali = require('../../ali.js');

var _ali2 = _interopRequireDefault(_ali);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var co = require('co');
var OSS = require('ali-oss');
_ali2.default.region = 'oss-cn-shanghai';
var client = new OSS(_ali2.default);

var renameFile = function renameFile(tmp_path, target_path) {
    return new _promise2.default(function (r, f) {
        // // 移动文件
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件, 
            fs.unlink(tmp_path, function () {
                if (err) throw err;
                r();
            });
        });
    });
},
    removeFile = function removeFile(path) {
    return new _promise2.default(function (r, f) {
        fs.unlink(path, function (err) {
            if (err) throw err;
            r();
        });
    });
},
    uploadImage = function uploadImage(path, name, buffer_data) {
    return new _promise2.default(function (r, f) {
        co(_regenerator2.default.mark(function _callee() {
            var result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            client.useBucket('ymark-public');
                            _context.next = 3;
                            return client.put(path + name, buffer_data);

                        case 3:
                            result = _context.sent;

                            r(result.url);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        })).catch(function (err) {
            console.log('err:', err);
            r();
        });
    });
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.imgAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _ref2, mbName, base64Code, type, path, link_name;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (this.allow) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            if (!(this.http.method.toLocaleLowerCase() != 'post')) {
                                _context2.next = 4;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-0.5, '参数错误'));

                        case 4:
                            _ref2 = this.post() || {};
                            mbName = _ref2.name;
                            base64Code = _ref2.k;
                            type = _ref2.t;
                            // 判断参数

                            if (!(!mbName || !type || !base64Code || base64Code.indexOf(';base64,') < 0)) {
                                _context2.next = 10;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数错误'));

                        case 10:
                            path = '';

                            if (type == 'yeelogo') {
                                path = 'yeelogo/template/';
                            } else if (type == 'yworlde') {
                                path = 'cloud/pay/';
                            }
                            base64Code = base64Code.replace(/^data:image\/\w+;base64,/, "");
                            // 得到文件
                            _context2.next = 15;
                            return uploadImage(path, mbName + '.png', new Buffer(base64Code, 'base64'));

                        case 15:
                            link_name = _context2.sent;

                            if (link_name) {
                                _context2.next = 18;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '上传错误！'));

                        case 18:
                            return _context2.abrupt('return', this.success(path + mbName + '.png'));

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function imgAction() {
            return _ref.apply(this, arguments);
        }

        return imgAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=upload.js.map