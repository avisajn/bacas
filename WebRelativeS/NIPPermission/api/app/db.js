'use strict';

exports.__esModule = true;
var mapping = {
  'development': {
    pwd: ''
  },
  'production': {
    pwd: 'root'
  }
};

var dbConfig = mapping[think.env];
exports.default = {
  type: 'mysql',
  log_sql: true,
  log_connect: false,
  dbhadoop: {
    type: 'mysql',
    host: '127.0.0.1',
    port: '3306',
    database: 'hadoop_fintech',
    user: 'root',
    password: dbConfig['pwd'], //数据库密码
    prefix: '',
    encoding: 'utf8'
  },

  dbpermission: {
    type: 'mysql',
    host: "localhost",
    port: "3306",
    database: "baka_permission", //数据库名称
    user: "root", //数据库帐号
    password: dbConfig['pwd'], //数据库密码
    prefix: "",
    encoding: "utf8"
  }
};
//# sourceMappingURL=db.js.map