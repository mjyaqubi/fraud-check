import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_PROVIDER, IConfig } from './provider';

@Injectable()
export class ConfigService {
  public env: string;

  public constructor(
    @Inject(CONFIG_PROVIDER) private readonly configProvider: IConfig,
  ) {
    switch (process.env.NODE_ENV) {
      case 'dev':
      case 'development':
        this.env = 'development';
        break;
      case 'qa':
      case 'test':
        this.env = 'test';
        break;
      case 'stage':
      case 'staging':
        this.env = 'staging';
        break;
      case 'prod':
      case 'production':
        this.env = 'production';
        break;
      default:
        this.env = 'development';
    }
  }

  public getEnv(key: string): string {
    key =
      typeof key === 'string' && key.indexOf('{{') === 0
        ? key.substring(2, key.length - 2)
        : key;

    return process.env[key];
  }

  public get<T>(keyConfig: string, def: any = ''): T {
    const value = this.configProvider.get(keyConfig);
    return this.getEnv(value) || value || def;
  }

  public has(keyConfig: string): boolean {
    return this.configProvider.has(keyConfig);
  }
}
