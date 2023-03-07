import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../common/config/module';
import { PromiseModule } from '../common/promise/module';
import { FraudAwayModule } from '../services/fraudAway/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudCheckController } from './controller';
import { FraudCheckService } from './service';
import { FraudCheckStatus } from './enum';
import {
  customerOrderId,
  customerOrderLowAmountRequest,
  customerOrderRequest,
  orderFraudCheckResult,
} from './mock';

describe('FraudCheckController', () => {
  let fraudCheckController: FraudCheckController;

  const orderFraudCheckFailedResult = {
    ...orderFraudCheckResult,
    orderAmount: 100,
    fraudCheckStatus: FraudCheckStatus.FAILED,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        PromiseModule,
        FraudAwayModule,
        SimpleFraudModule,
      ],
      controllers: [FraudCheckController],
      providers: [
        {
          provide: FraudCheckService,
          useValue: {
            getFraudCheck: jest.fn((id) => {
              return orderFraudCheckResult.orderFraudCheckId === id
                ? Promise.resolve(orderFraudCheckResult)
                : Promise.reject(new Error('OrderFraudCheck not found'));
            }),
            fraudCheck: jest.fn((_orderId, customerOrderRequest) => {
              return orderFraudCheckResult.orderAmount ===
                customerOrderRequest.orderAmount
                ? Promise.resolve(orderFraudCheckResult)
                : Promise.resolve(orderFraudCheckFailedResult);
            }),
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

    it('should return error (Fail)', () => {
      expect(
        fraudCheckController.getFraudCheck({
          orderFraudCheckId: '',
        }),
      ).rejects.toEqual(new Error('OrderFraudCheck not found'));
    });
  });

  describe('fraudCheck()', () => {
    it('should return the result (Pass)', () => {
      expect(
        fraudCheckController.fraudCheck(customerOrderId, customerOrderRequest),
      ).resolves.toEqual(orderFraudCheckResult);
    });

    it('should return the result (Fail)', () => {
      expect(
        fraudCheckController.fraudCheck(
          customerOrderId,
          customerOrderLowAmountRequest,
        ),
      ).resolves.toEqual(orderFraudCheckFailedResult);
    });
  });
});
