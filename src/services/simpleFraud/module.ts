import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PromiseModule } from '../../common/promise/module';
import { ConfigModule } from '../../common/config/module';
import { SimpleFraudService } from './service';
import { ConfigService } from 'src/common/config/service';
import { SERVICES_CONFIGS } from 'src/common/config/const';

@Module({
  imports: [
    ConfigModule,
    PromiseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get(SERVICES_CONFIGS.FRAUD_AWAY_TIMEOUT),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SimpleFraudService],
  exports: [SimpleFraudService],
})
export class SimpleFraudModule {}
