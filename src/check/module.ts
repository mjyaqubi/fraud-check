import { Module } from '@nestjs/common';
import { PromiseModule } from '../common/promise/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudAwayModule } from '../services/fraudAway/module';
import { CheckController } from './controller';
import { CheckService } from './service';

@Module({
  imports: [PromiseModule, FraudAwayModule, SimpleFraudModule],
  controllers: [CheckController],
  providers: [CheckService],
})
export class CheckModule {}
