import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/module';
import { ConfigService } from '../../common/config/service';
import { LoggerModule } from '../../common/logger/module';
import { PromiseModule } from '../../common/promise/module';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { SimpleFraudService } from './service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PromiseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get(SERVICES_CONFIGS.FRAUD_AWAY_TIMEOUT, 5000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SimpleFraudService],
  exports: [SimpleFraudService],
})
export class SimpleFraudModule {}
