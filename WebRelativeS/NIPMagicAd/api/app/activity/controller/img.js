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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _basemy = require('./basemy.js');

var _basemy2 = _interopRequireDefault(_basemy);

var _ali = require('../../ali.js');

var _ali2 = _interopRequireDefault(_ali);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var co = require('co');
var OSS = require('ali-oss');
_ali2.default.region = 'oss-cn-shanghai';
var exec = require('child_process').exec;
var client = new OSS(_ali2.default);

var renameFile = function renameFile(tmp_path, target_path) {
    return new _promise2.default(function (r, f) {
        // // 移动文件
        _fs2.default.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // 删除临时文件夹文件, 
            _fs2.default.unlink(tmp_path, function () {
                if (err) throw err;
                r();
            });
        });
    });
},
    removeFile = function removeFile(path) {
    return new _promise2.default(function (r, f) {
        _fs2.default.unlink(path, function (err) {
            if (err) throw err;
            r();
        });
    });
},
    uploadImage = function uploadImage(file_path, real_name) {
    return new _promise2.default(function (r, f) {
        co(_regenerator2.default.mark(function _callee() {
            var result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            client.useBucket('ymark-public');
                            _context.next = 3;
                            return client.put('yixiaotu/tmp/' + real_name, file_path);

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
            r();
        });
    });
},

// 压缩图片


// 将pdf转换成图片
pdf2Img = function pdf2Img(name, callback) {
    return new _promise2.default(function (r, f) {
        exec('/home/work/mupdf/mupdf-0.9-linux-amd64/pdfdraw -o out%d.png 12.pdf', function (err, stdout, stderr) {
            if (err) {
                console.log('get weather api error:' + stderr);
            } else {
                /*
                这个stdout的内容就是上面我curl出来的这个东西：
                {"weatherinfo":{"city":"北京","cityid":"101010100","temp":"3","WD":"西北风","WS":"3级","SD":"23%","WSE":"3","time":"21:20","isRadar":"1","Radar":"JC_RADAR_AZ9010_JB","njd":"暂无实况","qy":"1019"}}
                */
                var data = JSON.parse(stdout);
                console.log(data);
            }
        });
        co(_regenerator2.default.mark(function _callee2() {
            var result;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            client.useBucket('ymark-public');
                            _context2.next = 3;
                            return client.put('yixiaotu/tmp/' + real_name, file_path);

                        case 3:
                            result = _context2.sent;

                            r(result.url);

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        })).catch(function (err) {
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

    _class.prototype.uploadAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var params, mbname, param, files, file, tmp_path, oldName, type, ext, name;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (this.allow) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 2:
                            if (!(this.http.method.toLocaleLowerCase() != 'post')) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误'));

                        case 4:
                            params = this.post() || {}, mbname = params.name;

                            if (mbname) {
                                _context3.next = 7;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误'));

                        case 7:
                            param = this.post();
                            files = this.http._file;
                            file = files[0];
                            tmp_path = file.path, oldName = new Date().getTime() + "" + parseInt(Math.random() * 1000), type = file.headers['content-type'], ext = '.png';
                            name = oldName + ext;
                            return _context3.abrupt('return', this.success(-1));

                        case 13:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function uploadAction() {
            return _ref.apply(this, arguments);
        }

        return uploadAction;
    }();

    return _class;
}(_basemy2.default);

exports.default = _class;
//# sourceMappingURL=img.js.map