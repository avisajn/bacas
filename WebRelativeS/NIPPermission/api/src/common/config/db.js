'use strict';


const mapping = {
  'development' : {
    pwd : ''
  },
  'production' : {
    pwd : 'admin1!1'
  },
}
const dbConfig = mapping[think.env];
export default {
  type: 'mysql',
  log_sql: true,
  log_connect: false
}




// 'use strict';
// /**
//  * db config
//  * @type {Object}
//  */
// export default {
//   type: "mysql",
//   log_sql: true,
//   log_connect: false,
//   adapter: {
//     mysql: {
//       host: "localhost",
//       port: "3306",
//       database: "baka_permission", //数据库名称
//       user: "root", //数据库帐号
//       password: "admin1!", //数据库密码
//       prefix: "",
//       encoding: "utf8"
//     },
//     mongo: {

//     }
//   }
// };