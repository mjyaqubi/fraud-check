import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DATABASE_CONFIGS, LOGGER_CONFIGS } from './common/config/const';
import { ConfigModule } from './common/config/module';
import { ConfigService } from './common/config/service';
import { PromiseModule } from './common/promise/module';
import { LoggerModule } from './common/logger/module';
import { LoggerMiddleware } from './common/logger/middleware';
import { FraudAwayModule } from './services/fraudAway/module';
import { SimpleFraudModule } from './services/simpleFraud/module';
import { FraudCheckModel } from './fraudCheck/model';
import { CheckModule } from './fraudCheck/module';

@Module({
  imports: [
    ConfigModule,
    PromiseModule,
    LoggerModule,
    FraudAwayModule,
    SimpleFraudModule,
    CheckModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get(DATABASE_CONFIGS.DIALECT),
        host: configService.get(DATABASE_CONFIGS.HOST),
        port: configService.get(DATABASE_CONFIGS.PORT),
        username: configService.get(DATABASE_CONFIGS.USERNAME),
        password: configService.get(DATABASE_CONFIGS.PASSWORD),
        database: configService.get(DATABASE_CONFIGS.DATABASE),
        models: [FraudCheckModel],
      }),
      inject: [ConfigService],
    }),
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
