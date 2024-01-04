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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = _db2.default.activity;

var answerMapping = {
    '_1': 'A',
    '_2': 'B',
    '_3': 'C',
    '_4': 'D',
    '_5': 'E'
};

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // 返回所有的发布人
    _class.prototype.saveAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var param, name, city, phone, q_1, q_2, q_3, q_4, q_5, q_6, q_7, q_8, q_9, q_10, q_11, model, id;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 5:
                            model = this.model('mother_question', db);
                            _context.next = 8;
                            return model.add({ name: name, city: city, phone: phone, q_1: q_1, q_2: q_2, q_3: q_3, q_4: q_4, q_5: q_5, q_6: q_6, q_7: q_7, q_8: q_8, q_9: q_9, q_10: q_10, q_11: q_11 });

                        case 8:
                            id = _context.sent;

                            if (!id) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', this.success(id));

                        case 13:
                            return _context.abrupt('return', this.fail(-1, id));

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function saveAction() {
            return _ref.apply(this, arguments);
        }

        return saveAction;
    }();

    _class.prototype.getAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var model, res;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            res = _context2.sent;

                            res.map(function (k) {
                                k.q_1 = answerMapping['_' + k.q_1];
                                k.q_2 = answerMapping['_' + k.q_2];
                                k.q_3 = answerMapping['_' + k.q_3];
                                k.q_4 = answerMapping['_' + k.q_4];
                                k.q_5 = answerMapping['_' + k.q_5];
                                k.q_6 = answerMapping['_' + k.q_6];
                                k.q_7 = answerMapping['_' + k.q_7];
                                k.q_8 = answerMapping['_' + k.q_8];
                                k.q_9 = answerMapping['_' + k.q_9];
                            });
                            return _context2.abrupt('return', this.success(res));

                        case 7:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getAction() {
            return _ref2.apply(this, arguments);
        }

        return getAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=motherquestion.js.map