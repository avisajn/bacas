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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _azureStorage = require('azure-storage');

var _azureStorage2 = _interopRequireDefault(_azureStorage);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var container = 'news-images';
var cdnHost = {
    id: 'http://img.cdn.baca.co.id/',
    br: 'http://img.cdn.baca.co.id/'
};

var blobService = _azureStorage2.default.createBlobService('baca', 'AlfJeE0T/a0hWMXRTR0oYj7GVxhvNAkL+brSotrJqzWmsabcEGJBL57fvMFTe01tHidrvBGWihYmAE6o16ORBA==');

function readFiles(_path) {
    var fileList = [];
    var walk = function walk(path) {
        var dirList = _fs2.default.readdirSync(path);
        dirList.forEach(function (item) {
            if (_fs2.default.statSync(path + '/' + item).isDirectory()) {
                walk(path + '/' + item);
            } else {
                fileList.push(path + '' + item);
            }
        });
    };
    walk(_path);
    return fileList;
}

var uploadFile = function uploadFile(file_path, to_path, country) {
    var name = file_path.substring(file_path.lastIndexOf('/') + 1);
    // console.log('name:' ,name);
    return new _promise2.default(function (r, f) {
        // return r({});
        blobService.createBlockBlobFromLocalFile(container, to_path + name, file_path, function (error, result, response) {
            if (error || !response.isSuccessful) {
                r({ error: error });return;
            }
            r({ error: error, url: cdnHost[country] + to_path + name });
        });
    });
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.uploadAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var path, to_path, file_lists, urls, i, len, _ref2, error, url;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            path = '/Users/wangxiaowei/Desktop/tinified/';
                            to_path = 'event/gc/img/';
                            // const to_path = 'payloan/banner/';

                            file_lists = null;
                            urls = [];
                            _context.prev = 4;

                            file_lists = readFiles(path);
                            _context.next = 12;
                            break;

                        case 8:
                            _context.prev = 8;
                            _context.t0 = _context['catch'](4);

                            console.log(_context.t0);
                            return _context.abrupt('return', this.fail(-1, '读取目录错误！'));

                        case 12:
                            i = 0, len = file_lists.length;

                        case 13:
                            if (!(i < len)) {
                                _context.next = 23;
                                break;
                            }

                            _context.next = 16;
                            return uploadFile(file_lists[i], to_path, 'id');

                        case 16:
                            _ref2 = _context.sent;
                            error = _ref2.error;
                            url = _ref2.url;

                            if (error) {
                                console.log('error:', file_lists[i]);
                            } else {
                                urls.push(url);
                                console.log('url:', url);
                            }

                        case 20:
                            i++;
                            _context.next = 13;
                            break;

                        case 23:
                            return _context.abrupt('return', this.success(urls));

                        case 24:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[4, 8]]);
        }));

        function uploadAction() {
            return _ref.apply(this, arguments);
        }

        return uploadAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=test.js.map