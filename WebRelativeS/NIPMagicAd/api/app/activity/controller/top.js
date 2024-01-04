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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _db = require('../../db.js');

var _db2 = _interopRequireDefault(_db);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.activity;

var cache = (0, _lruCache2.default)({ maxAge: 1000 * 60 * 5 });

// http://img.cdn.baca.co.id/event/top10/avatar/1.png
var getRandom = function getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
};

var getFixed = function getFixed(v) {
    var fixNum = new Number(v + 1).toFixed(2); //四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 获取所有的评论列表
    _class.prototype.listAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _get, _get$page, page, localData, model, comments;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            // if(!this.allow) return this.fail(-1 ,'not allow'); 
                            _get = this.get();
                            _get$page = _get.page;
                            page = _get$page === undefined ? 1 : _get$page;
                            localData = cache.get('top-comments-page-' + page);

                            if (!(localData && localData.length > 0)) {
                                _context.next = 6;
                                break;
                            }

                            return _context.abrupt('return', this.success(localData));

                        case 6:
                            model = this.model('top_comments', db);
                            _context.next = 9;
                            return model.field('avatar,content,addtime').page(page, 10).order('id desc').select();

                        case 9:
                            comments = _context.sent;

                            cache.set('top-comments-page' + page, comments);
                            return _context.abrupt('return', this.success(comments));

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function listAction() {
            return _ref.apply(this, arguments);
        }

        return listAction;
    }();

    _class.prototype.addAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _post, comment, _post$name, name, ip, model, avatar_img, new_id;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            // if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
                            _post = this.post();
                            comment = _post.comment;
                            _post$name = _post.name;
                            name = _post$name === undefined ? '-' : _post$name;
                            ip = this.ip();
                            model = this.model('top_comments', db);
                            avatar_img = getRandom(1, 16) + '.png';
                            _context2.next = 9;
                            return model.add({
                                name: name, // 发起用户姓名
                                avatar: avatar_img,
                                content: comment,
                                ip: ip
                            });

                        case 9:
                            new_id = _context2.sent;

                            if (!(new_id > 0)) {
                                _context2.next = 15;
                                break;
                            }

                            cache.reset();
                            return _context2.abrupt('return', this.success(avatar_img));

                        case 15:
                            return _context2.abrupt('return', this.fail(-2, '添加失败！'));

                        case 16:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function addAction() {
            return _ref2.apply(this, arguments);
        }

        return addAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=top.js.map