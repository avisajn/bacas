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
  log_connect: false,
  connectionLimit : 10,
}