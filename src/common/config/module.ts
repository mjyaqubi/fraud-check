import { Module } from '@nestjs/common';
import { configProvider } from './provider';
import { ConfigService } from './service';

@Module({
  providers: [configProvider, ConfigService],
  exports: [configProvider, ConfigService],
})
export class ConfigModule {}
