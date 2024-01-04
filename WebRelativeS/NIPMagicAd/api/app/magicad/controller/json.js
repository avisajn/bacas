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

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _azureStorage = require('azure-storage');

var _azureStorage2 = _interopRequireDefault(_azureStorage);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = (0, _lruCache2.default)({ maxAge: 1000 * 60 * 60 });

var blobService = _azureStorage2.default.createBlobService('nipcleantool', '7kAN5quppIjeVs5KvAtC1UXcP1UBwgWJzIvWXNtosa4ZYf7Z20jmVncM8VaQtGGJPjfCivzvnIBN41BZfYjYQg==');

var basePath = think.RUNTIME_PATH + '/json/';
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
    writeFile = function writeFile(name, jsonData) {
    var file_path = basePath + name;
    return new _promise2.default(function (r, f) {
        _fs2.default.writeFile(file_path, (0, _stringify2.default)(jsonData), function (e) {
            r();
        });
    });
},
    getFile = function getFile(name, cname) {
    var file_path = basePath + name;
    var stream = _fs2.default.createWriteStream(file_path);
    return new _promise2.default(function (r, f) {
        blobService.getBlobToStream(cname, name, stream, function (error, result, response) {
            if (error != null && typeof error != 'undefined') return r({ err: (0, _stringify2.default)(error.message) });
            var data = _fs2.default.readFileSync(file_path, "utf-8");;
            return r(JSON.parse(data));
        });
    });
},
    getList = function getList(cname) {
    return new _promise2.default(function (r, f) {
        var path = 'https://nipcleantool.blob.core.windows.net/resources/';
        blobService.listBlobsSegmented(cname, null, function (error, result, response) {
            if (error != null && typeof error != 'undefined') return r({ err: (0, _stringify2.default)(error.message) });
            var res = [];
            result.entries.map(function (_ref) {
                var name = _ref.name;

                if (name.indexOf('.json') >= 0) res.push({ name: name });
            });
            return r(res);
        });
    });
},
    uploadFile = function uploadFile(name, cname) {
    return new _promise2.default(function (r, f) {
        blobService.createBlockBlobFromLocalFile(cname, name, basePath + name, {
            contentSettings: {
                contentType: 'application/json',
                cacheControl: 'public, max-age=300'
            }
        }, function (error, result, response) {
            if (error != null && typeof error != 'undefined') return r({ err: (0, _stringify2.default)(error.message) });
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

    // 返回处理后的列表
    _class.prototype.getAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _get, cname, local, list;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _get = this.get();
                            cname = _get.cname;

                            if (cname) {
                                _context.next = 4;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-1, '参数错误！'));

                        case 4:
                            local = cache.get('json-list-' + cname);

                            if (!local) {
                                _context.next = 7;
                                break;
                            }

                            return _context.abrupt('return', this.success(local));

                        case 7:
                            _context.next = 9;
                            return getList(cname);

                        case 9:
                            list = _context.sent;

                            cache.set('json-list-' + cname, list);
                            return _context.abrupt('return', this.success(list));

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getAction() {
            return _ref2.apply(this, arguments);
        }

        return getAction;
    }();

    _class.prototype.getjsonAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _get2, name, cname, local, content;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _get2 = this.get();
                            name = _get2.name;
                            cname = _get2.cname;

                            if (!(!name || !cname)) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1));

                        case 5:
                            local = cache.get('json-' + cname + '-' + name);

                            if (!local) {
                                _context2.next = 8;
                                break;
                            }

                            return _context2.abrupt('return', this.success(local));

                        case 8:
                            _context2.next = 10;
                            return getFile(name, cname);

                        case 10:
                            content = _context2.sent;

                            if (!content.err) {
                                _context2.next = 13;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(content.err));

                        case 13:
                            cache.set('json-' + cname + '-' + name, content);
                            return _context2.abrupt('return', this.success(content));

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getjsonAction() {
            return _ref3.apply(this, arguments);
        }

        return getjsonAction;
    }();

    _class.prototype.createjsonAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var _post, name, appname, configname, expireinseconds, cname;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _post = this.post();
                            name = _post.name;
                            appname = _post.appname;
                            configname = _post.configname;
                            expireinseconds = _post.expireinseconds;
                            cname = _post.cname;

                            if (!(!cname || !name || !appname || !configname || !expireinseconds)) {
                                _context3.next = 8;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1));

                        case 8:
                            _context3.next = 10;
                            return writeFile(name, {
                                AdUnitDetails: {},
                                AppName: appname,
                                ConfigName: configname,
                                ExpireInSeconds: expireinseconds
                            });

                        case 10:
                            _context3.next = 12;
                            return uploadFile(name, cname);

                        case 12:
                            cache.del('json-list-' + cname);
                            return _context3.abrupt('return', this.success('提交成功！'));

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function createjsonAction() {
            return _ref4.apply(this, arguments);
        }

        return createjsonAction;
    }();

    _class.prototype.testAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return uploadFile('adconfig_goclean.json', 'test');

                        case 2:
                            return _context4.abrupt('return', this.success('提交成功！'));

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function testAction() {
            return _ref5.apply(this, arguments);
        }

        return testAction;
    }();

    _class.prototype.submitcontentAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var _post2, k, name, cname, jsonData, AdUnitDetails, trueData, res;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _post2 = this.post();
                            k = _post2.k;
                            name = _post2.name;
                            cname = _post2.cname;

                            if (!(!k || !name || !cname)) {
                                _context5.next = 6;
                                break;
                            }

                            return _context5.abrupt('return', this.fail(-1));

                        case 6:
                            jsonData = null;
                            AdUnitDetails = null;
                            _context5.prev = 8;

                            jsonData = JSON.parse(k);
                            AdUnitDetails = jsonData.AdUnitDetails;
                            _context5.next = 16;
                            break;

                        case 13:
                            _context5.prev = 13;
                            _context5.t0 = _context5['catch'](8);
                            return _context5.abrupt('return', this.fail(-2));

                        case 16:
                            trueData = {};

                            AdUnitDetails.map(function (k) {
                                delete k.editble;
                                delete k.i;
                                delete k.clone;
                                var _type = k.Type;
                                delete k.Type;
                                if (!trueData[_type]) trueData[_type] = [];
                                trueData[_type].push(k);
                            });
                            jsonData['AdUnitDetails'] = trueData;
                            // 第一步，将JSON内容写入文件中
                            _context5.next = 21;
                            return writeFile(name, jsonData);

                        case 21:
                            _context5.next = 23;
                            return uploadFile(name, cname);

                        case 23:
                            res = _context5.sent;

                            // 清空服务器缓存
                            cache.del('json-' + cname + '-' + name);
                            return _context5.abrupt('return', this.success(res));

                        case 26:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[8, 13]]);
        }));

        function submitcontentAction() {
            return _ref6.apply(this, arguments);
        }

        return submitcontentAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=json.js.map