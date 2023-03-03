import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidV4 } from 'uuid';
import { THRESHOLD_CONFIGS } from '../common/config/const';
import { ConfigService } from '../common/config/service';
import { PromiseService } from '../common/promise/services';
import { FraudAwayRequest, PersonalAddress } from '../services/fraudAway/dto';
import { FraudAwayService } from '../services/fraudAway/service';
import { SimpleFraudRequest } from '../services/simpleFraud/dto';
import { SimpleFraudService } from '../services/simpleFraud/service';
import { CustomerOrder, OrderFraudCheck, ProviderResult } from './dto';
import { FraudCheckProviders, FraudCheckStatus } from './enum';
import { FraudCheckModel } from './model';

@Injectable()
export class FraudCheckService {
  private riskScoreThreshold: number;
  private bypassAmountThreshold: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly promiseService: PromiseService,
    private readonly fraudAwayService: FraudAwayService,
    private readonly simpleFraudService: SimpleFraudService,
    @InjectModel(FraudCheckModel)
    private readonly fraudCheckModel: typeof FraudCheckModel,
  ) {
    this.riskScoreThreshold = this.configService.get(
      THRESHOLD_CONFIGS.RISK_SCORE,
      0,
    );
    this.bypassAmountThreshold = this.configService.get(
      THRESHOLD_CONFIGS.BYPASS_AMOUNT,
      0,
    );
  }

  async getFraudCheck(orderFraudCheckId: string): Promise<OrderFraudCheck> {
    const existingResult = await this.fraudCheckModel.findOne({
      where: {
        orderFraudCheckId,
      },
    });

    if (!existingResult || !existingResult.orderFraudCheckId) {
      throw new Error('OrderFraudCheck not found');
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
    let providerResult: ProviderResult;

    // Fraud Away check
    const [fraudAwayResult, fraudAwayError] =
      await this.promiseService.resolver(this.fraudAwayCheck(request));

    if (!fraudAwayError) {
      providerResult = fraudAwayResult;
    }

    // Simple Fraud check
    if (!providerResult) {
      const [simpleFraudResult, simpleFraudError] =
        await this.promiseService.resolver(this.simpleFraudCheck(request));

      if (!simpleFraudError) {
        providerResult = simpleFraudResult;
      }
    }

    // Threshold check
    if (!providerResult) {
      providerResult = {
        name: FraudCheckProviders.BYPASS_THRESHOLD,
        response: {
          threshold: this.bypassAmountThreshold,
        },
        fraudCheckStatus:
          request.orderAmount <= this.bypassAmountThreshold
            ? FraudCheckStatus.PASSED
            : FraudCheckStatus.FAILED,
      };
    }

    // The database insert might be important so we can fail the request
    // The third party APIs result stored as string, can be JSON if required
    await this.fraudCheckModel.create({
      orderFraudCheckId,
      customerGuid: request.customerGuid,
      orderId: orderId,
      orderAmount: request.orderAmount,
      fraudCheckStatus: providerResult.fraudCheckStatus,
      providerResponse: JSON.stringify(providerResult),
    });

    return {
      orderFraudCheckId,
      customerGuid: request.customerGuid,
      orderId: orderId,
      orderAmount: request.orderAmount,
      fraudCheckStatus: providerResult.fraudCheckStatus,
    };
  }

  async fraudAwayCheck(request: CustomerOrder): Promise<ProviderResult> {
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
      throw new Error(error);
    }

    return <ProviderResult>{
      name: FraudCheckProviders.FRAUD_AWAY,
      response: response,
      fraudCheckStatus:
        response.fraudRiskScore &&
        response.fraudRiskScore < this.riskScoreThreshold
          ? FraudCheckStatus.PASSED
          : FraudCheckStatus.FAILED,
    };
  }

  async simpleFraudCheck(request: CustomerOrder): Promise<ProviderResult> {
    const simpleFraudRequest = <SimpleFraudRequest>{
      name: `${request.customerAddress.firstName} ${request.customerAddress.lastName}`,
      addressLine1: request.customerAddress.line1,
      postCode: request.customerAddress.postalCode,
    };

    const [response, error] = await this.promiseService.resolver(
      this.simpleFraudService.performFraudCheck(simpleFraudRequest),
    );

    if (error) {
      throw new Error(error);
    }

    return <ProviderResult>{
      name: FraudCheckProviders.SIMPLE_FRAUD,
      response: response,
      fraudCheckStatus:
        response.result === 'Pass'
          ? FraudCheckStatus.PASSED
          : FraudCheckStatus.FAILED,
    };
  }
}
