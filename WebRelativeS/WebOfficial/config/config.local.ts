import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.cluster = {
    listen: {
      path: '',
      port: 3310,
      hostname: '0.0.0.0',
    }
  }
  return config;
};
