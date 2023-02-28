import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidV4 } from 'uuid';
import { LoggerService } from '../common/logger/service';
import { PromiseService } from '../common/promise/services';
import { FraudAwayRequest, PersonalAddress } from '../services/fraudAway/dto';
import { FraudAwayService } from '../services/fraudAway/service';
import { SimpleFraudRequest } from '../services/simpleFraud/dto';
import { SimpleFraudService } from '../services/simpleFraud/service';
import { CustomerOrder, OrderFraudCheck } from './dto';
import { FraudCheckStatus } from './enum';
import { FraudCheckModel } from './model';

@Injectable()
export class FraudCheckService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly promiseService: PromiseService,
    private readonly fraudAwayService: FraudAwayService,
    private readonly simpleFraudService: SimpleFraudService,
    @InjectModel(FraudCheckModel)
    private readonly fraudCheckModel: typeof FraudCheckModel,
  ) {}

  async getFraudCheck(orderFraudCheckId: string): Promise<OrderFraudCheck> {
    const existingResult = await this.fraudCheckModel.findOne({
      where: {
        orderFraudCheckId,
      },
    });

    if (!existingResult || !existingResult.orderFraudCheckId) {
      throw new HttpException(
        'OrderFraudCheck not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return <OrderFraudCheck>{
      orderFraudCheckId: existingResult.orderFraudCheckId,
      customerGuid: existingResult.customerGuid,
      orderId: existingResult.orderId,
      orderAmount: existingResult.orderAmount,
      fraudCheckStatus: existingResult.fraudCheckStatus,
    };
  }

  async fraudCheck(
    orderId: string,
    request: CustomerOrder,
  ): Promise<OrderFraudCheck> {
    // Check database for existing data
    // TO-DO: to have a better performance we can use in memory db for most recent data
    const existingResult = await this.fraudCheckModel.findOne({
      where: {
        orderId,
        customerGuid: request.customerGuid,
        orderAmount: request.orderAmount,
      },
    });

    if (existingResult && existingResult.orderFraudCheckId) {
      return <OrderFraudCheck>{
        orderFraudCheckId: existingResult.orderFraudCheckId,
        customerGuid: existingResult.customerGuid,
        orderId: existingResult.orderId,
        orderAmount: existingResult.orderAmount,
        fraudCheckStatus: existingResult.fraudCheckStatus,
      };
    }

    // Check the third-party APIs
    const orderFraudCheckId = uuidV4();
    let thirdPartyResult: FraudCheckStatus;

    const [fraudAwayResult, fraudAwayError] =
      await this.promiseService.resolver(this.fraudAwayCheck(request));

    if (!fraudAwayError) {
      thirdPartyResult = fraudAwayResult;
    } else {
      const [simpleFraudResult, simpleFraudError] =
        await this.promiseService.resolver(this.simpleFraudCheck(request));

      if (!simpleFraudError) {
        thirdPartyResult = simpleFraudResult;
      }
    }

    if (!thirdPartyResult) {
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // The database insert might be important so we can fail the request
    await this.fraudCheckModel.create({
      orderFraudCheckId,
      customerGuid: request.customerGuid,
      orderId: orderId,
      orderAmount: request.orderAmount,
      fraudCheckStatus: thirdPartyResult,
    });

    return {
      orderFraudCheckId,
      customerGuid: request.customerGuid,
      orderId: orderId,
      orderAmount: request.orderAmount,
      fraudCheckStatus: thirdPartyResult,
    };
  }

  async fraudAwayCheck(request: CustomerOrder): Promise<FraudCheckStatus> {
    const fraudAwayRequest = <FraudAwayRequest>{
      personFullName: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      personAddress: <PersonalAddress>{
        addressLine1: request.customerAddress.line1,
        town: request.customerAddress.city,
        county: request.customerAddress.region,
        postCode: request.customerAddress.postalCode,
      },
    };

    const [response, error] = await this.promiseService.resolver(
      this.fraudAwayService.performFraudCheck(fraudAwayRequest),
    );

    if (error) {
      this.loggerService.log(
        `FraudAway service error - ${error}`,
        '[Third Party API]',
      );
      throw new Error('Something went wrong');
    }

    if (response.fraudRiskScore < 1) {
      return FraudCheckStatus.PASSED;
    }

    return FraudCheckStatus.FAILED;
  }

  async simpleFraudCheck(request: CustomerOrder): Promise<FraudCheckStatus> {
    const simpleFraudRequest = <SimpleFraudRequest>{
      name: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      addressLine1: request.customerAddress.line1,
      postCode: request.customerAddress.postalCode,
    };

    const [response, error] = await this.promiseService.resolver(
      this.simpleFraudService.performFraudCheck(simpleFraudRequest),
    );

    if (error) {
      this.loggerService.log(
        `SimpleFraud service error - ${error}`,
        '[Third Party API]',
      );
      throw new Error('Something went wrong');
    }

    if (response.result === 'Pass') {
      return FraudCheckStatus.FAILED;
    }

    return FraudCheckStatus.FAILED;
  }
}
