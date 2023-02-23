import { Injectable } from '@nestjs/common';
import { PromiseService } from '../common/promise/services';
import { SimpleFraudRequest } from '../services/simpleFraud/dto';
import { SimpleFraudService } from '../services/simpleFraud/service';
import { FraudAwayRequest, PersonalAddress } from '../services/fraudAway/dto';
import { FraudAwayService } from '../services/fraudAway/service';
import { CustomerOrder, OrderFraudCheck } from './dto';
import { FraudCheckStatus } from './enum';

@Injectable()
export class CheckService {
  constructor(
    private readonly promiseService: PromiseService,
    private readonly fraudAwayService: FraudAwayService,
    private readonly simpleFraudService: SimpleFraudService,
  ) {}

  async fraudCheck(
    orderId: string,
    request: CustomerOrder,
  ): Promise<OrderFraudCheck> {
    const fraudAwayRequest = <FraudAwayRequest>{
      personFullName: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      personAddress: <PersonalAddress>{
        addressLine1: request.customerAddress.line1,
        town: request.customerAddress.city,
        county: request.customerAddress.region,
        postCode: request.customerAddress.postalCode,
      },
    };

    const [fraudAwayResult, fraudAwayError] =
      await this.promiseService.resolver(
        this.fraudAwayService.performFraudCheck(fraudAwayRequest),
      );

    if (!fraudAwayError) {
      console.log('fraudAwayResult:', fraudAwayResult);
      const result = {
        //example: 'e9e85a67-4189-4096-9fdd-226d9d90e023'
        orderFraudCheckId: '',
        customerGuid: request.customerGuid,
        orderId: orderId,
        orderAmount: request.orderAmount,
        fraudCheckStatus: FraudCheckStatus.PASSED,
      };

      return result;
    }

    const simpleFraudRequest = <SimpleFraudRequest>{
      name: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      addressLine1: request.customerAddress.line1,
      postCode: request.customerAddress.postalCode,
    };

    const [simpleFraudResult, simpleFraudError] =
      await this.promiseService.resolver(
        this.simpleFraudService.performFraudCheck(simpleFraudRequest),
      );

    if (!simpleFraudError) {
      console.log('simpleFraudResult:', simpleFraudResult);
      const result = {
        //example: 'e9e85a67-4189-4096-9fdd-226d9d90e023'
        orderFraudCheckId: '',
        customerGuid: request.customerGuid,
        orderId: orderId,
        orderAmount: request.orderAmount,
        fraudCheckStatus: FraudCheckStatus.PASSED,
      };

      return result;
    }
  }

  private async fraudAwayCheck(orderId: string, request: CustomerOrder) {
    const fraudAwayRequest = <FraudAwayRequest>{
      personFullName: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      personAddress: <PersonalAddress>{
        addressLine1: request.customerAddress.line1,
        town: request.customerAddress.city,
        county: request.customerAddress.region,
        postCode: request.customerAddress.postalCode,
      },
    };

    const [fraudAwayResult, fraudAwayError] =
      await this.promiseService.resolver(
        this.fraudAwayService.performFraudCheck(fraudAwayRequest),
      );

    if (fraudAwayError) {
      throw 'ERROR';
    }

    let fraudCheckStatus = FraudCheckStatus.FAILED;
    if (fraudAwayResult.fraudRiskScore < 1) {
      fraudCheckStatus = FraudCheckStatus.PASSED;
    }

    const result = {
      //example: 'e9e85a67-4189-4096-9fdd-226d9d90e023'
      orderFraudCheckId: '',
      customerGuid: request.customerGuid,
      orderId: orderId,
      orderAmount: request.orderAmount,
      fraudCheckStatus,
    };

    return result;
  }
}
