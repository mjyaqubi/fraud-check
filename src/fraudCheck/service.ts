import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidV4 } from 'uuid';
import { PromiseService } from '../common/promise/services';
import { SimpleFraudRequest } from '../services/simpleFraud/dto';
import { SimpleFraudService } from '../services/simpleFraud/service';
import { FraudAwayRequest, PersonalAddress } from '../services/fraudAway/dto';
import { FraudAwayService } from '../services/fraudAway/service';
import { CustomerOrder, OrderFraudCheck } from './dto';
import { FraudCheckStatus } from './enum';
import { FraudCheckModel } from './model';

@Injectable()
export class FraudCheckService {
  constructor(
    private readonly promiseService: PromiseService,
    private readonly fraudAwayService: FraudAwayService,
    private readonly simpleFraudService: SimpleFraudService,
    @InjectModel(FraudCheckModel)
    private readonly fraudCheckModel: typeof FraudCheckModel,
  ) {}

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

  private async fraudAwayCheck(
    request: CustomerOrder,
  ): Promise<FraudCheckStatus> {
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
      throw error;
    }

    if (response.fraudRiskScore < 1) {
      return FraudCheckStatus.PASSED;
    }

    return FraudCheckStatus.FAILED;
  }

  private async simpleFraudCheck(
    request: CustomerOrder,
  ): Promise<FraudCheckStatus> {
    const simpleFraudRequest = <SimpleFraudRequest>{
      name: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      addressLine1: request.customerAddress.line1,
      postCode: request.customerAddress.postalCode,
    };

    const [response, error] = await this.promiseService.resolver(
      this.simpleFraudService.performFraudCheck(simpleFraudRequest),
    );

    if (error) {
      throw error;
    }

    if (response.result === 'Pass') {
      return FraudCheckStatus.FAILED;
    }

    return FraudCheckStatus.FAILED;
  }
}
