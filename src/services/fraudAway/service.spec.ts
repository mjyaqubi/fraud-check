import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { ConfigService } from '../../common/config/service';
import { ConfigModule } from '../../common/config/module';
import { LoggerModule } from '../../common/logger/module';
import { LoggerService } from '../../common/logger/service';
import { PromiseModule } from '../../common/promise/module';
import { PromiseService } from '../../common/promise/services';
import { FraudAwayService } from './service';

describe('FraudAwayService', () => {
  let service: FraudAwayService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule, LoggerModule, PromiseModule],
      providers: [
        ConfigService,
        LoggerService,
        PromiseService,
        FraudAwayService,
      ],
    }).compile();

    service = module.get<FraudAwayService>(FraudAwayService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('performFraudCheck()', () => {
    it('should perform fraud check (Pass)', () => {
      const request = {
        personFullName: 'John Doe',
        personAddress: {
          addressLine1: '611 Church Lane',
          town: 'Gloucester',
          county: 'Gloucestershire',
          postCode: 'GL26 0ZX',
        },
      };

      const response: AxiosResponse<unknown, any> = {
        data: { fraudRiskScore: 95.99 },
        headers: {},
        config: { headers: undefined, url: undefined },
        status: 200,
        statusText: 'OK',
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() => of(response));

      expect(service.performFraudCheck(request)).resolves.toEqual({
        fraudRiskScore: 95.99,
      });
    });

    it('should perform fraud check (Something went wrong)', () => {
      const request = {
        personFullName: 'John Doe',
        personAddress: {
          addressLine1: '611 Church Lane',
          town: 'Gloucester',
          county: 'Gloucestershire',
          postCode: 'GL26 0ZX',
        },
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() =>
          throwError({ response: '', status: '500' }),
        );

      expect(service.performFraudCheck(request)).rejects.toThrowError(
        'Something went wrong',
      );
    });
  });
});
