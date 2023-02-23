import { Module } from '@nestjs/common';
import { LoggerService } from './service';
import { ConfigModule } from '../config/module';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
