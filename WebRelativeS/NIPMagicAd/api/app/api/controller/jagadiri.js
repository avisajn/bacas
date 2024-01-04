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

var db = _db2.default.permisson;

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    // // 返回处理后的列表
    // async getadunitAction(){
    //     const model = this.model('adunit' ,db);
    //     const data = await model.field('id,name,creative_ratio,creative_size_limitation').where({app:'baca'}).select();
    //     // data.map((k) => {
    //     //     k.name = k.name+'_'+(parseInt(k.index)+1);
    //     //     delete k.index;
    //     // })
    //     return this.success(data);
    // }

    // 返回所有的发布人
    _class.prototype.getAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var model, data, content;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            model = this.model('jagadiri_users', db);
                            _context.next = 3;
                            return model.field('email,name,birthdate,phone,card,city,sex,addtime,platform').where("email not like '%12%'").select();

                        case 3:
                            data = _context.sent;


                            // const fileName= "data.xls";
                            // const _http = this.http;
                            // _http.header('Content-Type', 'application/vnd.ms-execl');
                            // _http.header('Content-Disposition', "attachment;filename="+encodeURIComponent(fileName));
                            // _http.header('Pragma', 'no-cache');
                            // _http.header('Expires', 0);

                            content = [];


                            data.map(function (k, i) {
                                k.sex = k.sex == '1' ? 'male' : 'female';
                                k.card = k.card == '1' ? 'yes' : 'no';
                                // if(i == 0){ content.push(`email\tname\tbirthdate\tphone\tcard\tcity\tsex`); }
                                // content.push(`${k.email}\t${k.name}\t${k.birthdate}\t${k.phone}\t${k.card}\t${k.city}\t${k.sex}`);
                            });
                            // _http.write(content.join('\n'));
                            this.json(data);

                        case 7:
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

    // 返回所有的发布人


    _class.prototype.saveuserAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var param, name, model, id;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            param = this.post();
                            name = param.name;

                            if (!(!param['name'] || !param['phone'] || !param['birthdate'] || !param['city'])) {
                                _context2.next = 4;
                                break;
                            }

                            return _context2.abrupt('return', this.fail(-1, '参数不正确'));

                        case 4:
                            model = this.model('jagadiri_users', db);
                            _context2.next = 7;
                            return model.add({
                                email: param['email'] || '0',
                                name: param['name'],
                                birthdate: param['birthdate'],
                                phone: param['phone'],
                                card: param['card'] || '0',
                                platform: param['platform'],
                                city: param['city'],
                                sex: param['sex']
                            });

                        case 7:
                            id = _context2.sent;

                            if (!id) {
                                _context2.next = 12;
                                break;
                            }

                            return _context2.abrupt('return', this.success(id));

                        case 12:
                            return _context2.abrupt('return', this.fail(-1, id));

                        case 13:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function saveuserAction() {
            return _ref2.apply(this, arguments);
        }

        return saveuserAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=jagadiri.js.map