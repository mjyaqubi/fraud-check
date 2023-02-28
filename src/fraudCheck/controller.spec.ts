import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../common/config/module';
import { LoggerModule } from '../common/logger/module';
import { PromiseModule } from '../common/promise/module';
import { FraudAwayModule } from '../services/fraudAway/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudCheckController } from './controller';
import { FraudCheckService } from './service';
import {
  customerOrderId,
  customerOrderRequest,
  orderFraudCheckResult,
} from './mock';

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
      providers: [
        {
          provide: FraudCheckService,
          useValue: {
            getFraudCheck: jest.fn(() => orderFraudCheckResult),
            fraudCheck: jest.fn(() => orderFraudCheckResult),
          },
        },
      ],
    }).compile();

    fraudCheckController = app.get<FraudCheckController>(FraudCheckController);
  });

  it('should be defined', () => {
    expect(fraudCheckController).toBeDefined();
  });

  describe('getFraudCheck()', () => {
    it('should return the result (Pass)', () => {
      expect(
        fraudCheckController.getFraudCheck({
          orderFraudCheckId: orderFraudCheckResult.orderFraudCheckId,
        }),
      ).resolves.toEqual(orderFraudCheckResult);
    });
  });

  describe('fraudCheck()', () => {
    it('should return the result (Pass)', () => {
      expect(
        fraudCheckController.fraudCheck(customerOrderId, customerOrderRequest),
      ).resolves.toEqual(orderFraudCheckResult);
    });
  });
});
