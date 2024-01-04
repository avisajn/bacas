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

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.saveAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var param, count, time, model, nums, precent, total;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 6:
                            model = this.model('iftar2_user', db);
                            _context.next = 9;
                            return model.add({
                                no: param.no || param.userid, // 用户编号
                                userid: param.userid,
                                name: param.name, // 用户名
                                phone: param.phone,
                                count: count,
                                time: time
                            });

                        case 9:
                            _context.next = 11;
                            return model.field('count(1) count').where('time >= ' + time).select();

                        case 11:
                            nums = _context.sent;

                            nums = nums[0].count;
                            precent = 0;

                            if (!(nums <= 1)) {
                                _context.next = 18;
                                break;
                            }

                            if (time <= 7) precent = 99.9;else if (time <= 20) precent = 85;else if (time <= 45) precent = 67;else if (time <= 80) precent = 56;else if (time <= 130) precent = 45;else precent = 25;

                            _context.next = 26;
                            break;

                        case 18:
                            _context.next = 20;
                            return model.field('count(1) count').select();

                        case 20:
                            total = _context.sent;

                            total = total[0].count;
                            console.log(nums, total);
                            precent = parseFloat(nums / total);
                            if (precent == 1) {
                                precent = 0.9999;
                            }
                            precent = precent * 100;

                        case 26:
                            return _context.abrupt('return', this.success({
                                precent: precent + '%'
                            }));

                        case 27:
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
                            return _context2.abrupt('return', this.success(res));

                        case 6:
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

    _class.prototype.xlsAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model, data, fileName, _http, content;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 4:
                            data = _context3.sent;
                            fileName = "data.xls";
                            _http = this.http;

                            _http.header('Content-Type', 'application/vnd.ms-execl');
                            _http.header('Content-Disposition', "attachment;filename=" + encodeURIComponent(fileName));
                            _http.header('Pragma', 'no-cache');
                            _http.header('Expires', 0);

                            content = [];


                            data.splice(0, 0, '编号总和\t姓名\t手机号\t尝试次数\t最短用时\t总用时');

                            // data.map((k ,i) => {
                            //     k.sex = k.sex == '1' ? 'male' : 'female';
                            //     k.card = k.card == '1' ? 'yes' : 'no';
                            // if(i == 0){ content.push(`email\tname\tbirthdate\tphone\tcard\tcity\tsex`); }
                            //     // content.push(`${k.email}\t${k.name}\t${k.birthdate}\t${k.phone}\t${k.card}\t${k.city}\t${k.sex}`);
                            // })
                            _http.write(data.join('\n'));
                            // this.json(data);

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function xlsAction() {
            return _ref3.apply(this, arguments);
        }

        return xlsAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=iftar2.js.map