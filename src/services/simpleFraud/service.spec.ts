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
import { SimpleFraudService } from './service';

describe('SimpleFraudService', () => {
  let service: SimpleFraudService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule, LoggerModule, PromiseModule],
      providers: [
        ConfigService,
        LoggerService,
        PromiseService,
        SimpleFraudService,
      ],
    }).compile();

    service = module.get<SimpleFraudService>(SimpleFraudService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateXmlRequest()', () => {
    it('should generate XML request', () => {
      expect(
        service.generateXmlRequest({
          name: 'John Doe',
          addressLine1: '18 Main Street',
          postCode: 'SE50 0ZD',
        }),
      ).toEqual(
        '<?xml version="1.0" encoding="UTF-8"?><RequestBody>' +
          '<name>John Doe</name><addressLine1>18 Main Street</addressLine1>' +
          '<postCode>SE50 0ZD</postCode></RequestBody>',
      );
    });
  });

  describe('extractResultFromXml()', () => {
    it('should extract result from XML response (Pass)', () => {
      expect(
        service.extractResultFromXml(
          '<?xml version="1.0" encoding="UTF-8"?>' +
            '<ResponseBody><result>Pass</result></ResponseBody>',
        ),
      ).toEqual('Pass');
    });

    it('should extract result from XML response (Fail)', () => {
      expect(
        service.extractResultFromXml(
          '<?xml version="1.0" encoding="UTF-8"?>' +
            '<ResponseBody><result>Fail</result></ResponseBody>',
        ),
      ).toEqual('Fail');
    });

    it('should extract result from XML response (unexpected result!)', () => {
      expect(() =>
        service.extractResultFromXml(
          '<?xml version="1.0" encoding="UTF-8"?>' +
            '<ResponseBody><result>Foo</result></ResponseBody>',
        ),
      ).toThrowError('unexpected result!');
    });

    it('should extract result from XML response (result is not exist in the response!)', () => {
      expect(() =>
        service.extractResultFromXml('<?xml version="1.0" encoding="UTF-8"?>'),
      ).toThrowError('result is not exist in the response!');
    });

    it('should extract result from XML response (response is empty!)', () => {
      expect(() => service.extractResultFromXml('')).toThrowError(
        'response is empty!',
      );
    });
  });

  describe('performFraudCheck()', () => {
    it('should perform fraud check (Pass)', () => {
      const request = {
        name: 'John Doe',
        addressLine1: '18 Main Street',
        postCode: 'SE50 0ZD',
      };

      const response: AxiosResponse<any> = {
        data:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<ResponseBody><result>Pass</result></ResponseBody>',
        headers: {},
        config: { headers: undefined, url: undefined },
        status: 200,
        statusText: 'OK',
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() => of(response));

      expect(service.performFraudCheck(request)).resolves.toEqual({
        result: 'Pass',
      });
    });

    it('should perform fraud check (Fail)', () => {
      const request = {
        name: 'John Doe',
        addressLine1: '18 Main Street',
        postCode: 'SE50 0ZD',
      };
      const response: AxiosResponse<any> = {
        data:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<ResponseBody><result>Fail</result></ResponseBody>',
        headers: {},
        config: { headers: undefined, url: undefined },
        status: 200,
        statusText: 'OK',
      };

      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() => of(response));

      expect(service.performFraudCheck(request)).resolves.toEqual({
        result: 'Fail',
      });
    });

    it('should perform fraud check (Something went wrong)', () => {
      const request = {
        name: 'John Doe',
        addressLine1: '18 Main Street',
        postCode: 'SE50 0ZD',
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
