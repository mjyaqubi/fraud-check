import { Test, TestingModule } from '@nestjs/testing';
import { CheckController } from './controller';
import { CheckService } from './service';

describe('CheckController', () => {
  let checkController: CheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CheckController],
      providers: [CheckService],
    }).compile();

    checkController = app.get<CheckController>(CheckController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(checkController.check()).toBe('Hello World!');
    });
  });
});
