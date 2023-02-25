import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PromiseModule } from '../common/promise/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudAwayModule } from '../services/fraudAway/module';
import { FraudCheckController } from './controller';
import { FraudCheckModel } from './model';
import { FraudCheckService } from './service';

@Module({
  imports: [
    PromiseModule,
    FraudAwayModule,
    SimpleFraudModule,
    SequelizeModule.forFeature([FraudCheckModel]),
  ],
  controllers: [FraudCheckController],
  providers: [FraudCheckService],
})
export class CheckModule {}
