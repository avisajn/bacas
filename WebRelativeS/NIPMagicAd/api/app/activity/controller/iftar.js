'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var db = _db2.default.activity;

var container = 'activity-images';
var cdnHost = {
    id: 'http://baca-activity.azureedge.net/',
    br: 'http://baca-activity.azureedge.net/'
};

var blobService = _azureStorage2.default.createBlobService('baca', 'AlfJeE0T/a0hWMXRTR0oYj7GVxhvNAkL+brSotrJqzWmsabcEGJBL57fvMFTe01tHidrvBGWihYmAE6o16ORBA==');

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
    uploadImage = function uploadImage(name, country) {
    var file_path = think.RUNTIME_PATH + '/upload/' + name;
    return new _promise2.default(function (r, f) {
        blobService.createBlockBlobFromLocalFile(container, 'iftar/' + name, file_path, function (error, result, response) {
            if (error || !response.isSuccessful) {
                r({ error: error });return;
            }
            console.log('result:', result, error);
            r({ error: error, url: cdnHost[country] + 'iftar/' + name });
        });
        // fileService.createDirectoryIfNotExists('taskshare', 'taskdirectory', function(error, result, response) {
        //   if (!error) {
        //     // if result = true, share was created.
        //     // if result = false, share already existed.
        //   }
        // });
    });
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 将图片上传到MagicAD的服务器
    _class.prototype.uploadimageAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var param, files, len, k, target_path, names, _k, file, oldName, ext, newName;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            param = this.post();
                            files = this.http._file;
                            len = 0;

                            for (k in files) {
                                len++;
                            }

                            if (!(len <= 0)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', this.fail(-4, '张数不对！'));

                        case 9:

                            // return this.success(think.RESOURCE_PATH);

                            target_path = think.RESOURCE_PATH + '/static/upd/';
                            names = [];
                            _context.t0 = _regenerator2.default.keys(files);

                        case 12:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 23;
                                break;
                            }

                            _k = _context.t1.value;
                            file = files[_k];
                            oldName = file.originalFilename;
                            ext = oldName.substring(oldName.lastIndexOf('.'));
                            newName = new Date().getTime() + "" + parseInt(Math.random() * 1000);

                            names.push(newName + ext);
                            _context.next = 21;
                            return renameFile(file.path, target_path + newName + ext);

                        case 21:
                            _context.next = 12;
                            break;

                        case 23:
                            return _context.abrupt('return', this.success(names));

                        case 24:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function uploadimageAction() {
            return _ref.apply(this, arguments);
        }

        return uploadimageAction;
    }();

    // 将图片上传到AZURE服务器


    _class.prototype.uploadAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, file, tmp_path, oldName, ext, name, target_path;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            param = this.post();
                            file = this.http._file.file;
                            tmp_path = file.path, oldName = new Date().getTime() + "" + parseInt(Math.random() * 1000), ext = '.jpg';

                            // return this.success('123123');

                            name = oldName + ext;
                            target_path = think.RUNTIME_PATH + '/upload/' + name;
                            _context2.next = 10;
                            return renameFile(tmp_path, target_path);

                        case 10:
                            return _context2.abrupt('return', this.success({}));

                        case 11:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function uploadAction() {
            return _ref2.apply(this, arguments);
        }

        return uploadAction;
    }();

    // 将图片上传到AZURE服务器


    _class.prototype.uploadazureAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, file, tmp_path, oldName, ext, name, target_path, _ref4, error, url;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            param = this.post();
                            file = this.http._file.file;
                            tmp_path = file.path, oldName = new Date().getTime() + "" + parseInt(Math.random() * 1000), ext = '.jpg';

                            // return this.success('123123');

                            name = oldName + ext;
                            target_path = think.RUNTIME_PATH + '/upload/' + name;
                            _context3.next = 10;
                            return renameFile(tmp_path, target_path);

                        case 10:
                            _context3.next = 12;
                            return uploadImage(name, 'id');

                        case 12:
                            _ref4 = _context3.sent;
                            error = _ref4.error;
                            url = _ref4.url;

                            if (!error) {
                                _context3.next = 17;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '上传错误！' + (0, _stringify2.default)(error)));

                        case 17:
                            _context3.next = 19;
                            return removeFile(target_path);

                        case 19:
                            return _context3.abrupt('return', this.success(url));

                        case 20:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function uploadazureAction() {
            return _ref3.apply(this, arguments);
        }

        return uploadazureAction;
    }();

    _class.prototype.setlikeAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var param, _from, _to, _type, model, paramObj, count, model_iftar, _model_iftar;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            model = this.model('iftar_like', db);
                            paramObj = { user_id: _from, iftar_id: _to };
                            _context4.next = 9;
                            return model.where(paramObj).count();

                        case 9:
                            count = _context4.sent;

                            if (!(_type == '1')) {
                                _context4.next = 21;
                                break;
                            }

                            // 添加
                            console.log('count:', count);

                            if (!(count == 0)) {
                                _context4.next = 18;
                                break;
                            }

                            model_iftar = this.model('iftar', db);
                            _context4.next = 16;
                            return model.add(paramObj);

                        case 16:
                            _context4.next = 18;
                            return model_iftar.execute('update iftar set `like`=`like`+1 where id=' + _to);

                        case 18:
                            return _context4.abrupt('return', this.success('提交成功！'));

                        case 21:
                            if (!(count > 0)) {
                                _context4.next = 27;
                                break;
                            }

                            _model_iftar = this.model('iftar', db);
                            _context4.next = 25;
                            return model.delete({ where: paramObj });

                        case 25:
                            _context4.next = 27;
                            return _model_iftar.execute('update iftar set `like`=`like`-1 where id=' + _to);

                        case 27:
                            return _context4.abrupt('return', this.success('取消成功！'));

                        case 28:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function setlikeAction() {
            return _ref5.apply(this, arguments);
        }

        return setlikeAction;
    }();

    _class.prototype.getlistAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var param, userid, res, model;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            return _context5.abrupt('return', this.fail(-1, 'not allow'));

                        case 7:
                            res = _context5.sent;

                            res.map(function (k) {
                                if (k.islike) {
                                    k.islike = 1;
                                } else {
                                    k.islike = '';
                                }
                            });
                            // console.log(res);
                            _context5.next = 14;
                            break;

                        case 11:
                            _context5.next = 13;
                            return model.field('id ,user_id, name, pic ,like , 0 as islike ').limit(0, 100).order('`like` desc').select();

                        case 13:
                            res = _context5.sent;

                        case 14:
                            return _context5.abrupt('return', this.success(res));

                        case 15:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function getlistAction() {
            return _ref6.apply(this, arguments);
        }

        return getlistAction;
    }();

    // 根据用户ID，获取相关内容


    _class.prototype.getbyidAction = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
            var param, userid, model, res;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            return _context6.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            model = this.model('iftar', db);
                            _context6.next = 7;
                            return model.field('user_id, name, pic ,like ,id ').where("user_id='" + userid + "' ").order('id desc').select();

                        case 7:
                            res = _context6.sent;

                            if (!(res.length <= 0)) {
                                _context6.next = 10;
                                break;
                            }

                            return _context6.abrupt('return', this.fail(-2, '不存在！'));

                        case 10:
                            return _context6.abrupt('return', this.success(res[0]));

                        case 11:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function getbyidAction() {
            return _ref7.apply(this, arguments);
        }

        return getbyidAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=iftar.js.map