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

var _baserestnone = require('./baserestnone.js');

var _baserestnone2 = _interopRequireDefault(_baserestnone);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateFormat = require('dateformat');

var db = _db2.default.dbpermission;

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.getAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var model, news_id, list, before_date, today, _list;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            model = this.model('trending', db);

                            if (!this.id) {
                                _context.next = 9;
                                break;
                            }

                            news_id = this.id;
                            _context.next = 5;
                            return model.field('news_id,new_news_id').where('new_news_id=\'' + news_id + '\' and status=1').select();

                        case 5:
                            list = _context.sent;
                            return _context.abrupt('return', this.success(list));

                        case 9:
                            before_date = (0, _moment2.default)().subtract(5, 'days').format('YYYY-MM-DD');
                            today = (0, _moment2.default)().format('YYYY-MM-DD');
                            _context.next = 13;
                            return model.field('news_id,new_news_id').order('id desc').where('addtime<=\'' + today + ' 23:59:59\' and addtime>=\'' + before_date + ' 00:00:00\' and status=1').select();

                        case 13:
                            _list = _context.sent;
                            return _context.abrupt('return', this.success(_list));

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getAction() {
            return _ref.apply(this, arguments);
        }

        return getAction;
    }();

    // 添加一条数据


    _class.prototype.postAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, news_id, new_news_id, time, model;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            param = this.post();
                            news_id = param.news_id, new_news_id = param.new_news_id;
                            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

                            if (news_id) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数不正确'));

                        case 5:
                            model = this.model('trending', db);
                            _context2.next = 8;
                            return model.add({ news_id: news_id, new_news_id: new_news_id, addtime: time, status: 0 });

                        case 8:
                            return _context2.abrupt('return', this.success('添加成功！'));

                        case 9:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function postAction() {
            return _ref2.apply(this, arguments);
        }

        return postAction;
    }();

    // 修改一条数据
    // 发布： 把状态改为1


    _class.prototype.putAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var param, news_ids, ids, model, insertId;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            param = this.post();
                            news_ids = param['news_ids'];

                            if (news_ids) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            ids = [];

                            if (news_ids.indexOf('-') > 0) {
                                news_ids = news_ids.split('-');
                                news_ids.map(function (k) {
                                    ids.push("'" + k + "'");
                                });
                            } else {
                                ids.push("'" + news_ids + "'");
                            }
                            model = this.model('trending', db);
                            _context3.next = 9;
                            return model.where('new_news_id in (' + ids.join(',') + ')').update({ status: 1 });

                        case 9:
                            insertId = _context3.sent;
                            return _context3.abrupt('return', this.success('修改成功'));

                        case 11:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function putAction() {
            return _ref3.apply(this, arguments);
        }

        return putAction;
    }();

    return _class;
}(_baserestnone2.default);

exports.default = _class;
//# sourceMappingURL=trending.js.map