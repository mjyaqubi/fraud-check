import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../common/config/service';
import { ConfigModule } from '../../common/config/module';
import { LoggerModule } from '../../common/logger/module';
import { LoggerService } from '../../common/logger/service';
import { PromiseModule } from '../../common/promise/module';
import { PromiseService } from '../../common/promise/services';
import { SimpleFraudService } from './service';

describe('SimpleFraudService', () => {
  let service: SimpleFraudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, HttpModule, LoggerModule, PromiseModule],
      providers: [
        ConfigService,
        // HttpService,
        LoggerService,
        PromiseService,
        SimpleFraudService,
      ],
    }).compile();

    service = module.get<SimpleFraudService>(SimpleFraudService);
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

  // ----

  // describe('create()', () => {
  //   it('should successfully insert a user', () => {
  //     const oneUser = {
  //       firstName: 'firstName #1',
  //       lastName: 'lastName #1',
  //     };
  //     expect(
  //       service.create({
  //         firstName: 'firstName #1',
  //         lastName: 'lastName #1',
  //       }),
  //     ).toEqual(oneUser);
  //   });
  // });

  // describe('findAll()', () => {
  //   it('should return an array of users', async () => {
  //     const users = await service.findAll();
  //     expect(users).toEqual(usersArray);
  //   });
  // });

  // describe('findOne()', () => {
  //   it('should get a single user', () => {
  //     const findSpy = jest.spyOn(model, 'findOne');
  //     expect(service.findOne('1'));
  //     expect(findSpy).toBeCalledWith({ where: { id: '1' } });
  //   });
  // });

  // describe('remove()', () => {
  //   it('should remove a user', async () => {
  //     const findSpy = jest.spyOn(model, 'findOne').mockReturnValue({
  //       destroy: jest.fn(),
  //     } as any);
  //     const retVal = await service.remove('2');
  //     expect(findSpy).toBeCalledWith({ where: { id: '2' } });
  //     expect(retVal).toBeUndefined();
  //   });
  // });
});
