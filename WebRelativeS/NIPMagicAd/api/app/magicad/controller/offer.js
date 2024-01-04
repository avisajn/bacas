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

var container = 'news-images';
var cdnHost = {
    id: 'http://img.cdn.baca.co.id/',
    br: 'http://img.cdn.baca.co.id/'
};

var db = _db2.default.dbmagicad;

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
    uploadImage = function uploadImage(name, country) {
    var file_path = think.RUNTIME_PATH + '/upload/' + name;
    return new _promise2.default(function (r, f) {
        blobService.createBlockBlobFromLocalFile(container, 'ads/' + name, file_path, function (error, result, response) {
            if (error || !response.isSuccessful) {
                r({ error: error });return;
            }
            r({ error: error, url: cdnHost[country] + 'ads/' + name });
        });
    });
},
    uploadFile = function uploadFile(name, path, country) {
    return new _promise2.default(function (r, f) {
        blobService.createBlockBlobFromLocalFile(container, 'event/top10/' + name, path + name, function (error, result, response) {
            if (error || !response.isSuccessful) {
                r({ error: error });return;
            }
            r({ error: error, url: cdnHost[country] + 'event/top10/' + name });
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
    _class.prototype.getadunitAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var model, data;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            model = this.model('adunit', db);
                            _context.next = 3;
                            return model.field('id,name,creative_ratio,creative_size_limitation').where({ app: 'baca' }).select();

                        case 3:
                            data = _context.sent;
                            return _context.abrupt('return', this.success(data));

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getadunitAction() {
            return _ref.apply(this, arguments);
        }

        return getadunitAction;
    }();

    _class.prototype.uploadtestAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var path, names, urls, i, len, _ref3, error, url;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            path = '/Users/wangxiaowei/Desktop/tinified/';
                            names = ['abg-nikah.jpg', 'ahok-rizieq.jpg', 'darah.jpg', 'dp-rumah.jpg', 'julia.jpg', 'pilkada.jpg', 'raffi-ayu.jpg', 'salman.jpg', 'uang.jpg', 'zakir.jpg'];
                            urls = [];
                            i = 0, len = names.length;

                        case 4:
                            if (!(i < len)) {
                                _context2.next = 14;
                                break;
                            }

                            _context2.next = 7;
                            return uploadFile(names[i], path, 'id');

                        case 7:
                            _ref3 = _context2.sent;
                            error = _ref3.error;
                            url = _ref3.url;

                            if (error) {
                                console.log('error:', names[i]);
                            } else {
                                urls.push(url);
                                console.log('url:', url);
                            }

                        case 11:
                            i++;
                            _context2.next = 4;
                            break;

                        case 14:
                            return _context2.abrupt('return', this.success(urls));

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function uploadtestAction() {
            return _ref2.apply(this, arguments);
        }

        return uploadtestAction;
    }();

    _class.prototype.getadunitsAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model, data;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            model = this.model('adunit', db);
                            _context3.next = 3;
                            return model.field("id,CONCAT(app,'_',name) as name,creative_ratio,creative_size_limitation").select();

                        case 3:
                            data = _context3.sent;
                            return _context3.abrupt('return', this.success(data));

                        case 5:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function getadunitsAction() {
            return _ref4.apply(this, arguments);
        }

        return getadunitsAction;
    }();

    // 返回所有的发布人


    _class.prototype.getpublisherAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var model, data;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            model = this.model('publisher', db);
                            _context4.next = 3;
                            return model.field('id,publisher_name name').select();

                        case 3:
                            data = _context4.sent;
                            return _context4.abrupt('return', this.success(data));

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function getpublisherAction() {
            return _ref5.apply(this, arguments);
        }

        return getpublisherAction;
    }();

    // 返回所有的发布人


    _class.prototype.savepublisherAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var param, name, model, id;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            param = this.post();
                            name = param.name;

                            if (name) {
                                _context5.next = 4;
                                break;
                            }

                            return _context5.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model = this.model('publisher', db);
                            _context5.next = 7;
                            return model.add({ publisher_name: name });

                        case 7:
                            id = _context5.sent;

                            if (!id) {
                                _context5.next = 12;
                                break;
                            }

                            return _context5.abrupt('return', this.success(id));

                        case 12:
                            return _context5.abrupt('return', this.fail(-1, id));

                        case 13:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function savepublisherAction() {
            return _ref6.apply(this, arguments);
        }

        return savepublisherAction;
    }();

    _class.prototype.deleteAction = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
            var _post, id, model_offer, insertId;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _post = this.post();
                            id = _post.id;

                            if (id) {
                                _context6.next = 4;
                                break;
                            }

                            return _context6.abrupt('return', this.fail('id为空！'));

                        case 4:
                            model_offer = this.model('offer', db);
                            _context6.next = 7;
                            return model_offer.where("id=" + id).update({ enable: 0 });

                        case 7:
                            insertId = _context6.sent;
                            return _context6.abrupt('return', this.success('删除成功！'));

                        case 9:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function deleteAction() {
            return _ref7.apply(this, arguments);
        }

        return deleteAction;
    }();

    _class.prototype.saveofferAction = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
            var param, name, start_time, end_time, adunit_id, publisher_id, cpm, ses_filter, age_filter, gender_filter, city_filter, width, height, cta, impression_cap, click_cap, target_url, click_callback_url, impression_callback_url, title, description, creative_url, country, dateNow, model_offer, model_creative, offer_param, offer_id, creative_id;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            param = this.post();
                            name = param.name, start_time = param.start_time, end_time = param.end_time, adunit_id = param.adunit, publisher_id = param.publisher, cpm = param.cpm, ses_filter = param.ses_filter || '', age_filter = param.age_filter || '', gender_filter = param.gender_filter || '', city_filter = param.city_filter || '', width = param.width, height = param.height, cta = param.cta_text, impression_cap = param.impression_cap, click_cap = param.click_cap, target_url = param.target_url, click_callback_url = param.click_callback_url, impression_callback_url = param.impression_callback_url, title = param.title, description = param.description, creative_url = param.creative_url, country = 'id', dateNow = (0, _moment2.default)(new Date()).format('YYYY-MM-DD HH:mm:ss');

                            if (name) {
                                _context7.next = 4;
                                break;
                            }

                            return _context7.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model_offer = this.model('offer', db);
                            model_creative = this.model('creative', db);
                            offer_param = {
                                updated_time: dateNow,
                                start_time: start_time,
                                end_time: end_time,
                                publisher_id: publisher_id,
                                adunit_id: adunit_id,
                                name: name,
                                cpm: cpm,
                                ses_filter: ses_filter,
                                age_filter: age_filter,
                                gender_filter: gender_filter,
                                location_filter: city_filter
                            };


                            if (impression_cap) offer_param['impression_cap'] = impression_cap;
                            if (click_cap) offer_param['click_cap'] = click_cap;

                            _context7.next = 11;
                            return model_offer.add(offer_param);

                        case 11:
                            offer_id = _context7.sent;

                            if (offer_id) {
                                _context7.next = 14;
                                break;
                            }

                            return _context7.abrupt('return', this.fail(-1, '插入offer出错！'));

                        case 14:
                            _context7.next = 16;
                            return model_creative.add({
                                offer_id: offer_id,
                                width: width,
                                height: height,
                                cta: cta,
                                creative_url: creative_url,
                                target_url: target_url,
                                click_callback_url: click_callback_url,
                                impression_callback_url: impression_callback_url,
                                title: title,
                                description: description
                            });

                        case 16:
                            creative_id = _context7.sent;

                            if (creative_id) {
                                _context7.next = 19;
                                break;
                            }

                            return _context7.abrupt('return', this.fail(-1, '插入creative出错！'));

                        case 19:
                            return _context7.abrupt('return', this.success({ offer_id: offer_id, creative_id: creative_id }));

                        case 20:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function saveofferAction() {
            return _ref8.apply(this, arguments);
        }

        return saveofferAction;
    }();

    _class.prototype.getAction = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
            var _get, _get$current, current, u, where, model_offer, column, list;

            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _get = this.get();
                            _get$current = _get.current;
                            current = _get$current === undefined ? 1 : _get$current;
                            u = _get.u;
                            where = ' base.enable = 1 ';

                            if (!u) {
                                where += " and u.app='baca' ";
                            }
                            model_offer = this.model('offer', db);
                            column = ['base.id as offer_id', 'base.start_time as start_time', 'base.end_time as end_time', 'base.publisher_id as publisher_id', 'base.impression_cap as impression_cap', 'base.click_cap as click_cap', 'base.adunit_id as adunit_id', 'base.name as name', 'base.cpm as cpm', 'base.ses_filter as ses_filter', 'base.age_filter as age_filter', 'base.gender_filter as gender_filter', 'base.location_filter as city_filter', 'c.width as width', 'c.height as height', 'c.cta as cta', 'c.creative_url as creative_url', 'c.target_url as target_url', 'c.click_callback_url as click_callback_url', 'c.impression_callback_url as impression_callback_url', 'c.title as title', 'c.description as description'];
                            _context8.next = 10;
                            return model_offer.alias('base').field(column).join('creative c on c.offer_id = base.id').join('adunit u on u.id = base.adunit_id').where(where).order('base.id desc').page(current, 20).select();

                        case 10:
                            list = _context8.sent;

                            list.map(function (k) {
                                k.start_time_str = (0, _moment2.default)(k.start_time).add(7, 'hour').format('YYYY-MM-DD HH:mm:ss');
                                k.end_time_str = (0, _moment2.default)(k.end_time).add(7, 'hour').format('YYYY-MM-DD HH:mm:ss');
                                k.start_time = (0, _moment2.default)(k.start_time).add(7, 'hour').format('YYYY-MM-DD');
                                k.end_time = (0, _moment2.default)(k.end_time).add(7, 'hour').format('YYYY-MM-DD');
                            });
                            return _context8.abrupt('return', this.success(list));

                        case 13:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function getAction() {
            return _ref9.apply(this, arguments);
        }

        return getAction;
    }();

    _class.prototype.updimgAction = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
            var _post2, offer_id, creative_url, width, height, model, insertId;

            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _post2 = this.post();
                            offer_id = _post2.offer_id;
                            creative_url = _post2.creative_url;
                            width = _post2.width;
                            height = _post2.height;

                            if (!(!offer_id || !creative_url)) {
                                _context9.next = 7;
                                break;
                            }

                            return _context9.abrupt('return', this.fail(-1, '参数错误！'));

                        case 7:
                            model = this.model('creative', db);
                            _context9.next = 10;
                            return model.where("offer_id=" + offer_id).update({
                                creative_url: creative_url,
                                width: width,
                                height: height
                            });

                        case 10:
                            insertId = _context9.sent;
                            return _context9.abrupt('return', this.success('修改成功！'));

                        case 12:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function updimgAction() {
            return _ref10.apply(this, arguments);
        }

        return updimgAction;
    }();

    _class.prototype.uploadimageAction = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
            var param, start, end, title, file, tmp_path, oldName, ext, name, target_path, _ref12, error, url;

            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (!(this.http.method != 'POST')) {
                                _context10.next = 2;
                                break;
                            }

                            return _context10.abrupt('return', this.fail(-1));

                        case 2:
                            param = this.post(), start = param.start, end = param.end, title = param.title;
                            file = this.http._file[0];

                            if (!(!file || !start || !end || !title)) {
                                _context10.next = 6;
                                break;
                            }

                            return _context10.abrupt('return', this.fail(-1, '参数错误！'));

                        case 6:
                            tmp_path = file.path, oldName = file.originalFilename, ext = oldName.substring(oldName.lastIndexOf('.'));
                            name = title + "_" + start + "_" + end + ext;
                            target_path = think.RUNTIME_PATH + '/upload/' + name;
                            _context10.next = 11;
                            return renameFile(tmp_path, target_path);

                        case 11:
                            _context10.next = 13;
                            return uploadImage(name, 'id');

                        case 13:
                            _ref12 = _context10.sent;
                            error = _ref12.error;
                            url = _ref12.url;

                            if (!error) {
                                _context10.next = 18;
                                break;
                            }

                            return _context10.abrupt('return', this.fail(-1, '上传错误！' + (0, _stringify2.default)(error)));

                        case 18:
                            return _context10.abrupt('return', this.success(url));

                        case 19:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function uploadimageAction() {
            return _ref11.apply(this, arguments);
        }

        return uploadimageAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=offer.js.map