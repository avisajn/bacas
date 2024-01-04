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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = (0, _lruCache2.default)({ maxAge: 1000 * 60 * 20 });

var avatarArr = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg', '31.jpg', '32.jpg', '33.jpg', '34.jpg', '35.jpg', '36.jpg', '37.jpg', '38.jpg', '39.jpg', '40.jpg', '41.jpg', '42.jpg', '43.jpg', '44.jpg', '45.jpg', '46.jpg', '47.jpg', '48.jpg', '49.jpg', '50.jpg', '51.jpg', '52.jpg', '53.jpg', '54.jpg', '55.jpg', '56.jpg', '57.jpg', '58.jpg', '59.jpg', '60.jpg', '61.jpg', '62.jpg', '63.jpg', '64.jpg', '65.jpg', '66.jpg', '67.jpg', '68.jpg', '69.jpg', '70.jpg', '71.jpg', '72.jpg', '73.jpg', '84.jpg'];
var nameArr = ['Ahmad', 'Levina', 'Christina', 'Natasha', 'Lidya', 'Johan', 'Rangga', 'Dimas', 'Randy', 'Jason'];
var tempResultArr = [[-1, 1, 1, -1, 1, -1], [1, -1, -1, -1, 1, 1], [1, 1, 1, 1, 1, -1], [-1, 1, 1, 1, 1, 1], [-1, 1, 1, -1, -1, -1]];
var tempTimeArr = ['15.1', '6.88', '12.6', '15', '20', '18.4', '13.8'];

var db = _db2.default.activity;

// 倔强青铜 （PK<=2次）
// 秩序白银 （PK<=4次 且 胜率>40%）
// 荣耀黄金 （PK<=6次 且 胜率>50%）
// 尊贵铂金 （PK<=8次 且 胜率>60%）
// 永恒钻石 （PK<=10次 且 胜率>70%）
// 最强王者 （PK=10次 且 胜率>90%）
// 次数和胜率都可以根据情况作出改变
var getPw = function getPw(cs, sl) {
    if (cs <= 2) return 'Perunggu Stubborn'; // '倔强青铜';
    if (cs <= 4 && sl >= 40) return 'Silver Rangka'; // '秩序白银';
    if (cs <= 6 && sl >= 50) return 'Glory Emas'; // '荣耀黄金';
    if (cs <= 8 && sl >= 60) return 'Premier Platinum'; // '尊贵铂金';
    if (cs <= 10 && sl >= 70) return 'Berlian Keabadian'; // '永恒钻石';
    if (cs <= 10 && sl >= 90) return 'Raja Terkuat'; // '最强王者';
};

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

    // 获取获奖名单
    // TODO : 增加memcache缓存
    _class.prototype.prizelistAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var localData, model_film_prize, currentDateTime, userList;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            localData = cache.get('prize-list');

                            if (!(localData && localData.length > 0)) {
                                _context.next = 6;
                                break;
                            }

                            return _context.abrupt('return', this.success(localData));

                        case 6:
                            model_film_prize = this.model('film_prize', db);
                            currentDateTime = (0, _moment2.default)().add(7, 'h').format('YYYY-MM-DD');
                            _context.next = 10;
                            return model_film_prize.alias('base').field('times cs,winning sl,total_times zys,prize_name jp,u.name xm ,u.phone sj').join('film_user u on  base.user_id=u.id').order('base.id desc').where('base.prize_datetime>"' + currentDateTime + ' 00:00:00" and base.prize_datetime<="' + currentDateTime + ' 23:59:59"').select();

                        case 10:
                            userList = _context.sent;

                            if (!(userList.length <= 0)) {
                                _context.next = 15;
                                break;
                            }

                            return _context.abrupt('return', this.success([]));

                        case 15:
                            (function () {
                                var _phone = null;
                                userList.map(function (k) {
                                    _phone = k.sj;
                                    k.sj = _phone && _phone.substring(0, 3) + ' *** ' + _phone.substring(_phone.length - 2);
                                });
                            })();

                        case 16:

                            cache.set('prize-list', userList);
                            return _context.abrupt('return', this.success(userList));

                        case 18:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function prizelistAction() {
            return _ref.apply(this, arguments);
        }

        return prizelistAction;
    }();
    // 获取排名信息


    _class.prototype.pmlistAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var currentDate, currentHH, localData, model_film_standing, userList;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            currentDate = (0, _moment2.default)().add(7, 'h').format('MMDD');
                            currentHH = (0, _moment2.default)().add(7, 'h').format('HH');

                            if (!(currentDate == '0824' && currentHH <= 20)) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.abrupt('return', this.success([{ cs: 10, sl: 100, zys: 59, xm: 'Jason', sj: '782 *** 559' }, { cs: 10, sl: 100, zys: 60, xm: 'Levina', sj: '991 *** 574' }, { cs: 10, sl: 100, zys: 60.3, xm: 'Natasha', sj: '079 *** 670' }, { cs: 10, sl: 90, zys: 62, xm: 'Johan', sj: '319 *** 824' }, { cs: 10, sl: 90, zys: 65, xm: 'Rangga', sj: '021 *** 312' }]));

                        case 7:
                            // select b.* from film_standing b 
                            // left join film_user u on u.id = b.user_id 
                            // order by b.times desc,b.win desc ,b.total_time 
                            // where date='0824';

                            localData = cache.get('standing-pm-' + currentDate);

                            if (!(localData && localData.length > 0)) {
                                _context2.next = 10;
                                break;
                            }

                            return _context2.abrupt('return', this.success(localData));

                        case 10:
                            model_film_standing = this.model('film_standing', db);
                            _context2.next = 13;
                            return model_film_standing.field('b.times cs,b.total_time zys,b.winning sl,u.`name` mz,u.phone sj').alias('b').join('film_user u on u.id = b.user_id ').order('b.times desc,b.win desc ,b.total_time ').limit(0, 20).where('b.date=\'' + currentDate + '\' and b.times<=10').select();

                        case 13:
                            userList = _context2.sent;

                            if (userList.length <= 4) {
                                // ['Ahmad', 'Levina', 'Christina', 'Natasha', 'Lidya', 'Johan', 'Rangga', 'Dimas', 'Randy', 'Jason'];
                                userList = [{ cs: 10, sl: 100, zys: 59, xm: 'Jason', sj: '782 *** 559' }, { cs: 10, sl: 100, zys: 60, xm: 'Levina', sj: '991 *** 574' }, { cs: 10, sl: 100, zys: 60.3, xm: 'Natasha', sj: '079 *** 670' }, { cs: 10, sl: 90, zys: 62, xm: 'Johan', sj: '319 *** 824' }, { cs: 10, sl: 90, zys: 65, xm: 'Rangga', sj: '021 *** 312' }];
                            } else {
                                (function () {
                                    var _phone = null;
                                    userList.map(function (k) {
                                        _phone = k.sj;
                                        k.sj = _phone && _phone.substring(0, 3) + ' *** ' + _phone.substring(_phone.length - 2);
                                    });
                                })();
                            }

                            cache.set('standing-pm-' + currentDate, userList);
                            return _context2.abrupt('return', this.success(userList));

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function pmlistAction() {
            return _ref2.apply(this, arguments);
        }

        return pmlistAction;
    }();

    // 获取我的信息
    // TODO : 对用户信息增加7天的缓存 


    _class.prototype.myinfoAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var _get, ud, uid, model_film_user, user, avatar_img, user_id;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get = this.get();
                            ud = _get.ud;
                            uid = _get.uid;

                            if (!(!ud && !uid)) {
                                _context3.next = 8;
                                break;
                            }

                            return _context3.abrupt('return', this.fail(-1, '参数错误！'));

                        case 8:

                            // 先获取用户信息
                            model_film_user = this.model('film_user', db);
                            _context3.next = 11;
                            return model_film_user.where('k=\'' + ud + '\' or id=\'' + uid + '\'').field('id,name mz,avatar tx,phone sj,address dz,isupd upd').select();

                        case 11:
                            user = _context3.sent;

                            if (!(user.length <= 0)) {
                                _context3.next = 18;
                                break;
                            }

                            avatar_img = 'http://event.baca.co.id/res/a/' + avatarArr[getRandom(0, avatarArr.length - 1)];
                            _context3.next = 16;
                            return model_film_user.add({
                                k: ud,
                                name: '-',
                                avatar: avatar_img,
                                phone: '-',
                                address: '-',
                                isupd: 0
                            });

                        case 16:
                            user_id = _context3.sent;
                            return _context3.abrupt('return', this.success({
                                id: user_id,
                                tx: avatar_img,
                                upd: 0,
                                sj: '-',
                                mz: '-'
                            }));

                        case 18:
                            user = user[0];
                            return _context3.abrupt('return', this.success(user));

                        case 20:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function myinfoAction() {
            return _ref3.apply(this, arguments);
        }

        return myinfoAction;
    }();

    // 获取我的战绩
    // TODO : 对用户信息增加7天的缓存 


    _class.prototype.mystandingAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var _get2, uid, currentDate, model_film_standing, record, sql, pmInfo;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get2 = this.get();
                            uid = _get2.uid;

                            if (uid) {
                                _context4.next = 7;
                                break;
                            }

                            return _context4.abrupt('return', this.fail(-1, '参数错误！'));

                        case 7:

                            // 获取战绩信息
                            currentDate = (0, _moment2.default)().add(7, 'h').format('MMDD');
                            model_film_standing = this.model('film_standing', db);
                            _context4.next = 11;
                            return model_film_standing.field('times cs,total_time zys,winning sl,win scs').where('user_id=' + uid + ' and date=\'' + currentDate + '\'').select();

                        case 11:
                            record = _context4.sent;

                            if (!(record.length <= 0)) {
                                _context4.next = 14;
                                break;
                            }

                            return _context4.abrupt('return', this.success({ cs: 0, sl: 0, pw: getPw(0, 0), pm: '99+' }));

                        case 14:
                            record = record[0];
                            // 获取排名
                            sql = 'select b.i from (select (@i:=@i+1) as i,b.user_id from film_standing b,(select @i:=0) as it  where b.date=\'' + currentDate + '\' and b.times<= 10 order by b.times desc ,b.win desc,b.total_time) b where b.user_id=' + uid + ';';
                            _context4.next = 18;
                            return model_film_standing.query(sql);

                        case 18:
                            pmInfo = _context4.sent;

                            if (pmInfo.length > 0) {
                                pmInfo = pmInfo[0];
                                record.pm = pmInfo.i + 1;
                            }
                            record.pw = getPw(record.cs, record.sl);

                            return _context4.abrupt('return', this.success(record));

                        case 22:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function mystandingAction() {
            return _ref4.apply(this, arguments);
        }

        return mystandingAction;
    }();

    // 获取我的PK记录
    // TODO : 对交战记录增加缓存


    _class.prototype.myrecordAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var _get3, uid, localData, model_film_record, currentDate, recordList;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            return _context5.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get3 = this.get();
                            uid = _get3.uid;

                            if (uid) {
                                _context5.next = 7;
                                break;
                            }

                            return _context5.abrupt('return', this.fail(-1, '参数错误！'));

                        case 7:
                            localData = cache.get('ud-record-' + uid);

                            if (!(localData && localData.length > 0)) {
                                _context5.next = 10;
                                break;
                            }

                            return _context5.abrupt('return', this.success(localData));

                        case 10:
                            model_film_record = this.model('film_record', db);
                            currentDate = (0, _moment2.default)().add(7, 'h').format('YYYY-MM-DD');
                            _context5.next = 14;
                            return model_film_record.field('create_user_name cnm ,create_user_avatar cav ,opponent_user_name onm ,opponent_user_avatar oav ,total_time zys ,res jg ,addtime tm').where('create_user_id=' + uid + ' and addtime<=\'' + currentDate + ' 23:59:59\' and addtime>=\'' + currentDate + ' 00:00:00\' ').select();

                        case 14:
                            recordList = _context5.sent;

                            if (!(recordList.length <= 0)) {
                                _context5.next = 17;
                                break;
                            }

                            return _context5.abrupt('return', this.success([]));

                        case 17:
                            cache.set('ud-record-' + uid, recordList);
                            return _context5.abrupt('return', this.success(recordList));

                        case 19:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function myrecordAction() {
            return _ref5.apply(this, arguments);
        }

        return myrecordAction;
    }();

    // 得到已经使用的题库的序号


    _class.prototype.gettikunotAction = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
            var _get4, uid, model_film_record, currentDate, tiku_ids, otherObjs;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            return _context6.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get4 = this.get();
                            uid = _get4.uid;

                            if (uid) {
                                _context6.next = 7;
                                break;
                            }

                            return _context6.abrupt('return', this.success({ '_1': 1, '_2': 2, '_3': 3, '_4': 4, '_5': 5, '_6': 6, '_7': 7, '_8': 8, '_9': 9, '_10': 10 }));

                        case 7:
                            // 先匹配已经玩过的题库，之后从没玩过的里头随机挑选一个用户
                            model_film_record = this.model('film_record', db);
                            currentDate = (0, _moment2.default)().add(7, 'h').format('YYYY-MM-DD');
                            _context6.next = 11;
                            return model_film_record.field('tiku_id').where('create_user_id=' + uid + ' and addtime<=\'' + currentDate + ' 23:59:59\' and addtime>=\'' + currentDate + ' 00:00:00\' ').select();

                        case 11:
                            tiku_ids = _context6.sent;
                            otherObjs = { '_1': 1, '_2': 2, '_3': 3, '_4': 4, '_5': 5, '_6': 6, '_7': 7, '_8': 8, '_9': 9, '_10': 10 };

                            if (tiku_ids.length > 0) {
                                tiku_ids.map(function (_ref7) {
                                    var tiku_id = _ref7.tiku_id;
                                    return delete otherObjs['_' + tiku_id];
                                });
                            }
                            return _context6.abrupt('return', this.success(otherObjs));

                        case 15:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function gettikunotAction() {
            return _ref6.apply(this, arguments);
        }

        return gettikunotAction;
    }();

    // 得到一个题库


    _class.prototype.gettikuAction = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
            var _get5, uid, currentTikuId, currentDate, model_film_record, model_film_tiku, tiku_info, question, order, opponent;

            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            return _context7.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _get5 = this.get();
                            uid = _get5.uid;
                            currentTikuId = _get5.tk;

                            if (!(!uid || !currentTikuId)) {
                                _context7.next = 8;
                                break;
                            }

                            return _context7.abrupt('return', this.fail(-1, '参数错误！'));

                        case 8:
                            currentDate = (0, _moment2.default)().add(7, 'h').format('YYYY-MM-DD');
                            model_film_record = this.model('film_record', db);
                            // 获取题库的内容

                            model_film_tiku = this.model('film_tiku', db);
                            _context7.next = 13;
                            return model_film_tiku.field('no tk_id,question_json').where('date=\'' + (0, _moment2.default)().add(7, 'h').format('MMDD') + '\' and no=' + currentTikuId).select();

                        case 13:
                            tiku_info = _context7.sent;

                            if (!(tiku_info.length <= 0)) {
                                _context7.next = 16;
                                break;
                            }

                            return _context7.abrupt('return', this.fail(-1, '匹配出错！'));

                        case 16:
                            tiku_info = tiku_info[0];
                            _context7.prev = 17;
                            question = JSON.parse(tiku_info.question_json);

                            tiku_info.question_json = question;
                            _context7.next = 25;
                            break;

                        case 22:
                            _context7.prev = 22;
                            _context7.t0 = _context7['catch'](17);
                            return _context7.abrupt('return', this.fail(-1, '获取问题出错！'));

                        case 25:
                            order = [];
                            // 根据随机数进行排序

                            if (parseInt(Math.random() * 10) > 5) order.push('id desc');
                            if (parseInt(Math.random() * 10) < 7) order.push('total_time desc');
                            if (parseInt(Math.random() * 10) > 5) order.push('record_json desc');
                            if (parseInt(Math.random() * 10) > 5) order.push('res desc');
                            if (parseInt(Math.random() * 10) > 5) order.push('create_user_id desc');
                            if (parseInt(Math.random() * 10) > 5) order.push('opponent_user_id desc');

                            // 根据剩余的题库中，随意选一个对手
                            _context7.next = 34;
                            return model_film_record.field('create_user_id oid ,create_user_name onm,create_user_avatar oav,record_json jg,total_time zys').where('create_user_id!=' + uid + ' and tiku_id=' + currentTikuId + ' and addtime<=\'' + currentDate + ' 23:59:59\' and addtime>=\'' + currentDate + ' 00:00:00\'').order(order.join(',')).select();

                        case 34:
                            opponent = _context7.sent;

                            if (opponent.length <= 5) {
                                // 随机生成一个对手
                                opponent = {
                                    oid: getRandom(1, 20),
                                    onm: nameArr[getRandom(0, nameArr.length - 1)],
                                    oav: 'http://event.baca.co.id/res/a/' + avatarArr[getRandom(0, avatarArr.length - 1)],
                                    jg: tempResultArr[getRandom(0, tempResultArr.length - 1)],
                                    zys: getRandom(6, 25) + '.' + getRandom(1, 9)
                                };
                            } else {
                                opponent = opponent[0];
                                opponent.jg = JSON.parse(opponent.jg);
                            }
                            return _context7.abrupt('return', this.success({
                                tiku_info: tiku_info, opponent: opponent
                            }));

                        case 37:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[17, 22]]);
        }));

        function gettikuAction() {
            return _ref8.apply(this, arguments);
        }

        return gettikuAction;
    }();

    // 提交一个PK战绩


    _class.prototype.pstadingAction = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
            var _post, currentTikuId, create_id, create_name, create_avatar, opponent_id, opponent_name, opponent_avatar, total_time, record_json, res, currentDate, model_film_record, model_film_standing, record_id, oldStanding, win_times, total_times;

            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            return _context8.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _post = this.post();
                            currentTikuId = _post.tk;
                            create_id = _post.cid;
                            create_name = _post.cnm;
                            create_avatar = _post.cvt;
                            opponent_id = _post.aid;
                            opponent_name = _post.anm;
                            opponent_avatar = _post.avt;
                            total_time = _post.zys;
                            record_json = _post.jgjson;
                            res = _post.jg;

                            if (!(!currentTikuId || !create_id || !create_name || !create_avatar || !opponent_id || !opponent_name || !opponent_avatar || !total_time || !record_json || !res)) {
                                _context8.next = 16;
                                break;
                            }

                            return _context8.abrupt('return', this.fail(-1, '参数错误！'));

                        case 16:
                            currentDate = (0, _moment2.default)().add(7, 'h').format('MMDD');
                            model_film_record = this.model('film_record', db);
                            model_film_standing = this.model('film_standing', db);
                            // 向记录表中插入一条记录

                            _context8.next = 21;
                            return model_film_record.add({
                                tiku_id: currentTikuId, // 题库ID
                                create_user_id: create_id, // 发起用户ID
                                create_user_name: create_name, // 发起用户姓名
                                create_user_avatar: create_avatar, // 发起用户头像
                                opponent_user_id: opponent_id, // PK的用户ID
                                opponent_user_name: opponent_name, // PK的用户姓名
                                opponent_user_avatar: opponent_avatar, // PK的用户头像
                                total_time: total_time, // 总用时
                                record_json: record_json, // 战绩JSON串 : [对，错，对，对，错，错]
                                res: res });

                        case 21:
                            record_id = _context8.sent;
                            _context8.next = 24;
                            return model_film_standing.where('user_id=' + create_id + ' and date=\'' + currentDate + '\'').select();

                        case 24:
                            oldStanding = _context8.sent;

                            if (!(oldStanding.length <= 0)) {
                                _context8.next = 30;
                                break;
                            }

                            _context8.next = 28;
                            return model_film_standing.add({
                                user_id: create_id, // 用户ID
                                times: '1', // 参与次数
                                total_time: total_time, // 累计用时
                                winning: res == '1' ? '100' : '0', // 胜率
                                date: currentDate });

                        case 28:
                            _context8.next = 36;
                            break;

                        case 30:
                            // 有的话，拿出过去的，然后修改其值
                            oldStanding = oldStanding[0];
                            console.log('oldStanding', oldStanding);
                            win_times = oldStanding.win + (res == '1' ? 1 : 0);
                            total_times = parseInt(oldStanding.times) + 1;
                            _context8.next = 36;
                            return model_film_standing.where('id=' + oldStanding.id).update({
                                times: total_times,
                                total_time: parseFloat(oldStanding.total_time) + parseFloat(total_time),
                                winning: getFixed(parseFloat(win_times / total_times)) * 100,
                                win: win_times
                            });

                        case 36:
                            cache.del('ud-record-' + create_id);
                            return _context8.abrupt('return', this.success('提交成功！'));

                        case 38:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function pstadingAction() {
            return _ref9.apply(this, arguments);
        }

        return pstadingAction;
    }();

    // 提交一个用户信息


    _class.prototype.pinfoAction = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
            var _post2, user_id, udKey, name, avatar, phone, address, pupd, model_film_user, updParam, upds;

            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            return _context9.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _post2 = this.post();
                            user_id = _post2.uid;
                            udKey = _post2.ud;
                            name = _post2.nm;
                            avatar = _post2.av;
                            phone = _post2.ph;
                            address = _post2.ad;
                            pupd = _post2.d;

                            if (!(!name || !phone || !address)) {
                                _context9.next = 13;
                                break;
                            }

                            return _context9.abrupt('return', this.fail(-1, '参数错误！'));

                        case 13:
                            if (user_id) {
                                _context9.next = 16;
                                break;
                            }

                            if (!(!udKey || !avatar)) {
                                _context9.next = 16;
                                break;
                            }

                            return _context9.abrupt('return', this.fail(-1, '参数错误！'));

                        case 16:
                            model_film_user = this.model('film_user', db);

                            if (!user_id) {
                                _context9.next = 27;
                                break;
                            }

                            updParam = {
                                name: name,
                                phone: phone,
                                address: address,
                                isupd: 1
                            };

                            if (pupd == '-1' || pupd == -1) {
                                updParam['isupd'] = 0;
                            }
                            _context9.next = 22;
                            return model_film_user.where('id=' + user_id + ' and isupd=0').update(updParam);

                        case 22:
                            upds = _context9.sent;

                            if (!(upds == 0)) {
                                _context9.next = 25;
                                break;
                            }

                            return _context9.abrupt('return', this.fail(-1, '不能再次修改了！'));

                        case 25:
                            _context9.next = 30;
                            break;

                        case 27:
                            _context9.next = 29;
                            return model_film_user.add({
                                k: udKey,
                                name: name,
                                avatar: avatar,
                                phone: phone,
                                address: address,
                                isupd: 0
                            });

                        case 29:
                            user_id = _context9.sent;

                        case 30:
                            cache.del('ud-info-' + user_id);
                            return _context9.abrupt('return', this.success({
                                id: user_id,
                                msg: '提交成功'
                            }));

                        case 32:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function pinfoAction() {
            return _ref10.apply(this, arguments);
        }

        return pinfoAction;
    }();

    // 修改用户头像


    _class.prototype.pavatarAction = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
            var _post3, user_id, avatar, model_film_user, upds;

            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            return _context10.abrupt('return', this.fail(-1, 'not allow'));

                        case 3:
                            _post3 = this.post();
                            user_id = _post3.uid;
                            avatar = _post3.av;

                            if (!(!user_id || !avatar)) {
                                _context10.next = 8;
                                break;
                            }

                            return _context10.abrupt('return', this.fail(-1, '参数错误！'));

                        case 8:
                            model_film_user = this.model('film_user', db);
                            _context10.next = 11;
                            return model_film_user.where('id=' + user_id).update({ avatar: avatar });

                        case 11:
                            upds = _context10.sent;

                            if (!(upds != 1)) {
                                _context10.next = 14;
                                break;
                            }

                            return _context10.abrupt('return', this.fail(-1, '修改失败！'));

                        case 14:
                            cache.del('ud-info-' + user_id);
                            return _context10.abrupt('return', this.success('提交成功！'));

                        case 16:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function pavatarAction() {
            return _ref11.apply(this, arguments);
        }

        return pavatarAction;
    }();

    return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=film.js.map