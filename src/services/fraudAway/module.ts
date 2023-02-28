import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { ConfigModule } from '../../common/config/module';
import { ConfigService } from '../../common/config/service';
import { LoggerModule } from '../../common/logger/module';
import { PromiseModule } from '../../common/promise/module';
import { FraudAwayService } from './service';

@Module({
  imports: [
    ConfigModule,
    PromiseModule,
    LoggerModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get(SERVICES_CONFIGS.FRAUD_AWAY_TIMEOUT, 5000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [FraudAwayService],
  exports: [FraudAwayService],
})
export class FraudAwayModule {}
