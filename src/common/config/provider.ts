import { Provider } from '@nestjs/common';
import * as config from 'config';
import * as dotenv from 'dotenv';

dotenv.config();

export const CONFIG_PROVIDER = 'CONFIG_PROVIDER';
export type IConfig = config.IConfig;

export const configProvider: Provider = {
  useFactory: (): config.IConfig => {
    return config;
  },
  provide: CONFIG_PROVIDER,
};
