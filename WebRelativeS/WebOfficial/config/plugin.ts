import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  }
  // mysql: {
  //   enable: true,
  //   package: 'egg-mysql',
  // },
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
};

export default plugin;
