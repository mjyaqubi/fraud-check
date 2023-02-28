import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConfigService } from '../common/config/service';
import { ConfigModule } from '../common/config/module';
import { LoggerModule } from '../common/logger/module';
import { LoggerService } from '../common/logger/service';
import { PromiseModule } from '../common/promise/module';
import { PromiseService } from '../common/promise/services';
import { FraudAwayModule } from '../services/fraudAway/module';
import { SimpleFraudModule } from '../services/simpleFraud/module';
import { FraudCheckStatus } from './enum';
import { FraudCheckService } from './service';
import { FraudCheckModel } from './model';
import {
  customerOrderId,
  customerOrderRequest,
  orderFraudCheckId,
  orderFraudCheckResult,
  orderFraudCheckResultWithoutId,
} from './mock';

describe('FraudCheckService', () => {
  let service: FraudCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        LoggerModule,
        PromiseModule,
        FraudAwayModule,
        SimpleFraudModule,
      ],
      providers: [
        ConfigService,
        LoggerService,
        PromiseService,
        FraudCheckService,
        {
          provide: getModelToken(FraudCheckModel),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn((query) => {
              if (
                query.where.orderFraudCheckId === orderFraudCheckId ||
                query.where.orderId === orderFraudCheckResult.orderId
              ) {
                return orderFraudCheckResult;
              } else {
                return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FraudCheckService>(FraudCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFraudCheck()', () => {
    it('should find the fraud check result from database (Pass)', () => {
      expect(service.getFraudCheck(orderFraudCheckId)).resolves.toEqual(
        orderFraudCheckResult,
      );
    });

    it('should find the fraud check result from database (Fail)', () => {
      expect(service.getFraudCheck('abcd')).rejects.toThrowError(
        'OrderFraudCheck not found',
      );
    });
  });

  describe('fraudCheck()', () => {
    it('should find the fraud check result from database (Pass)', () => {
      expect(
        service.fraudCheck(orderFraudCheckResult.orderId, customerOrderRequest),
      ).resolves.toEqual(orderFraudCheckResult);
    });

    it('should call to third party API to get result (FraudAway Pass)', () => {
      jest
        .spyOn(service, 'fraudAwayCheck')
        .mockImplementationOnce(async () => FraudCheckStatus.PASSED);

      expect(
        service.fraudCheck(customerOrderId, customerOrderRequest),
      ).resolves.toMatchObject(orderFraudCheckResultWithoutId);
    });

    it('should call to third party API to get result (SimpleFraud Pass)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest
        .spyOn(service, 'fraudAwayCheck')
        .mockRejectedValue(new Error('Something went wrong'));

      jest
        .spyOn(service, 'simpleFraudCheck')
        .mockImplementationOnce(async () => FraudCheckStatus.PASSED);

      expect(
        service.fraudCheck(customerOrderId, customerOrderRequest),
      ).resolves.toMatchObject(orderFraudCheckResultWithoutId);
    });

    it('should call to third party API to get result (Fail)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest
        .spyOn(service, 'fraudAwayCheck')
        .mockRejectedValue(new Error('Something went wrong'));

      jest
        .spyOn(service, 'simpleFraudCheck')
        .mockRejectedValue(new Error('Something went wrong'));

      expect(
        service.fraudCheck(customerOrderId, customerOrderRequest),
      ).rejects.toThrowError('Service Unavailable');
    });
  });
});
