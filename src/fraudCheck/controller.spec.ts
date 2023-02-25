import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../common/config/module';
import { PromiseModule } from '../common/promise/module';
import { LoggerModule } from '../common/logger/module';
import { FraudAwayModule } from '../services/fraudAway/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudCheckController } from './controller';
import { FraudCheckService } from './service';

describe('FraudCheckController', () => {
  let fraudCheckController: FraudCheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        PromiseModule,
        LoggerModule,
        FraudAwayModule,
        SimpleFraudModule,
      ],
      controllers: [FraudCheckController],
      providers: [FraudCheckService],
    }).compile();

    fraudCheckController = app.get<FraudCheckController>(FraudCheckController);
  });

  it('should be defined', () => {
    expect(fraudCheckController).toBeDefined();
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     // expect(checkController.check()).toBe('Hello World!');
  //   });
  // });
});
