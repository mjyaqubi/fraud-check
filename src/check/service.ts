import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
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
    let result: OrderFraudCheck;

    const [fraudAwayResult, fraudAwayError] =
      await this.promiseService.resolver(this.fraudAwayCheck(request));

    if (!fraudAwayError) {
      result = {
        orderFraudCheckId: uuidV4(),
        customerGuid: request.customerGuid,
        orderId: orderId,
        orderAmount: request.orderAmount,
        fraudCheckStatus: fraudAwayResult,
      };
    } else {
      const [simpleFraudResult, simpleFraudError] =
        await this.promiseService.resolver(this.simpleFraudCheck(request));

      if (!simpleFraudError) {
        result = {
          orderFraudCheckId: uuidV4(),
          customerGuid: request.customerGuid,
          orderId: orderId,
          orderAmount: request.orderAmount,
          fraudCheckStatus: simpleFraudResult,
        };
      }
    }

    if (!result.fraudCheckStatus) {
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // store in db

    return result;
  }

  private generateFraudAwayRequest(req: CustomerOrder): FraudAwayRequest {
    return <FraudAwayRequest>{
      personFullName: `${req.customerAddress.firstName} ${req.customerAddress.lastName}`,
      personAddress: <PersonalAddress>{
        addressLine1: req.customerAddress.line1,
        town: req.customerAddress.city,
        county: req.customerAddress.region,
        postCode: req.customerAddress.postalCode,
      },
    };
  }

  private generateSimpleAwayRequest(req: CustomerOrder): SimpleFraudRequest {
    return <SimpleFraudRequest>{
      name: `${req.customerAddress.firstName} ${req.customerAddress.lastName}`,
      addressLine1: req.customerAddress.line1,
      postCode: req.customerAddress.postalCode,
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
