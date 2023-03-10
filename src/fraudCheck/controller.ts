import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import * as ResponseDecorator from '../common/response/decorator';
import { CustomerOrder, OrderFraudCheck, OrderFraudCheckParams } from './dto';
import { FraudCheckService } from './service';

@Controller('check')
@ApiTags('Order Fraud Check')
export class FraudCheckController {
  constructor(private readonly fraudCheckService: FraudCheckService) {}

  @Put(':orderId')
  @ApiOperation({
    operationId: 'fraud-check',
    summary:
      'Perform a fraud check for the customer order and returns the result of the check',
    description: 'Create and perform a fraud check for a customer order',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    format: 'alphanumeric',
    description: 'Id of the order to perform the fraud check for',
  })
  @ResponseDecorator.Successful(OrderFraudCheck)
  @ResponseDecorator.BadRequest('Invalid Order ID or body supplied')
  @ResponseDecorator.ServiceUnavailable()
  async fraudCheck(
    @Param('orderId') orderId: string,
    @Body() req: CustomerOrder,
  ): Promise<OrderFraudCheck> {
    try {
      return this.fraudCheckService.fraudCheck(orderId, req);
    } catch (error) {
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(':orderFraudCheckId')
  @ApiOperation({
    operationId: 'fraud-check-result',
    summary: 'Find the result of an order fraud check by its Id',
    description: 'Retrieves the results of and order fraud check by its Id',
  })
  @ApiParam({
    name: 'orderFraudCheckId',
    type: 'string',
    format: 'guid',
    description: 'Id of the fraud check result',
  })
  @ResponseDecorator.Successful(OrderFraudCheck)
  @ResponseDecorator.BadRequest('Invalid Order ID or body supplied')
  @ResponseDecorator.NotFound('OrderFraudCheck Not Found')
  async getFraudCheck(
    @Param() params: OrderFraudCheckParams,
  ): Promise<OrderFraudCheck> {
    try {
      return this.fraudCheckService.getFraudCheck(params.orderFraudCheckId);
    } catch (error) {
      throw new HttpException(
        'OrderFraudCheck not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
