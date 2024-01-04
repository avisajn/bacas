'use strict';

exports.__esModule = true;
var mapping = {
  'development': {
    pwd: ''
  },
  'production': {
    pwd: 'admin1!1'
  }
};
var dbConfig = mapping[think.env];
exports.default = {
  type: 'mysql',
  log_sql: true,
  log_connect: false,
  connectionLimit: 10
};
//# sourceMappingURL=db.js.map