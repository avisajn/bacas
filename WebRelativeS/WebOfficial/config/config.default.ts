import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1626242053313_4374';

  // add your egg config in here
  config.middleware = ['host'];
  config.proxy = true
  config.static = {}

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [
      "https://test.admin.mokkaya.com",
      "https://admin.mokkaya.com",
      "https://vendor.mokkaya.com",
      "https://test.vendor.mokkaya.com",
    ]
  }

  config.view = {
    mapping: {
      '.ejs': 'ejs',
    }
  }

  // config database
  // config.mysql = {
    // client: {
    //   // host
    //   host: 'ecommysql.mysql.database.azure.com',
    //   // port
    //   port: '3306',
    //   // username
    //   user: 'ecom@ecommysql',
    //   // password
    //   password: 'bjzgcsh@5213',
    //   // database
    //   database: 'cekiceki_test',    
    // },
    // app: true,
  // }

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };
  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
