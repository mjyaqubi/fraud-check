import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from './common/config/module';
import { LOGGER_CONFIGS } from './common/config/const';
import { ConfigService } from './common/config/service';
import { PromiseModule } from './common/promise/module';
import { LoggerModule } from './common/logger/module';
import { LoggerMiddleware } from './common/logger/middleware';
import { FraudAwayModule } from './services/fraudAway/module';
import { SimpleFraudModule } from './services/simpleFraud/module';
import { CheckModule } from './check/module';

@Module({
  imports: [
    ConfigModule,
    PromiseModule,
    LoggerModule,
    FraudAwayModule,
    SimpleFraudModule,
    CheckModule,
  ],
})
export class AppModule {
  httpLogger = false;

  constructor(private readonly config: ConfigService) {
    this.httpLogger = this.config.get(LOGGER_CONFIGS.HTTP, false);
  }

  configure(consumer: MiddlewareConsumer) {
    if (this.httpLogger) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
    }
  }
}
