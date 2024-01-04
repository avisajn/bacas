'use strict';

exports.__esModule = true;
var mapping = {
  'development': {
    host: '127.0.0.1',
    pwd: '',

    normal_pwd: ''
  },
  'production': {
    host: 'usadadmin.westus.cloudapp.azure.com',
    pwd: 'Baca@123',

    normal_pwd: 'root'
  }
};
var dbConfig = mapping[think.env];
// const dbConfig = mapping['production'];
exports.default = {
  type: 'mysql',
  log_sql: true,
  log_connect: false,
  dbmagicad: { // app关于食谱的所有API所用到的数据库
    type: 'mysql',
    host: dbConfig['host'],
    port: '3306',
    database: 'magicadsystem',
    user: 'root',
    password: dbConfig['pwd'], //数据库密码
    prefix: '',
    encoding: 'utf8'
  },
  permisson: {
    type: 'mysql', //这里需要将 type 重新设置为 mysql
    host: '127.0.0.1',
    port: '3306',
    database: 'baka_permission',
    user: 'root',
    password: dbConfig['normal_pwd'],
    prefix: '',
    encoding: 'utf8'
  },

  activity: {
    type: 'mysql', //这里需要将 type 重新设置为 mysql
    host: '127.0.0.1',
    port: '3306',
    database: 'baka_activity',
    user: 'root',
    password: dbConfig['normal_pwd'],
    prefix: '',
    encoding: 'utf8'
  }
};
//# sourceMappingURL=db.js.map