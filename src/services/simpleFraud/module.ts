import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PromiseModule } from '../../common/promise/module';
import { ConfigModule } from '../../common/config/module';
import { ConfigService } from '../../common/config/service';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { SimpleFraudService } from './service';

@Module({
  imports: [
    ConfigModule,
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
