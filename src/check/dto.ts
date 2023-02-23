import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { FraudCheckStatus } from './enum';

export class Address {
  @ApiProperty({
    type: 'string',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    type: 'string',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    type: 'string',
    example: '10 High Street',
  })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({
    type: 'string',
    example: 'London',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    type: 'string',
    example: 'Greater London',
  })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({
    type: 'string',
    example: 'W1T 3HE',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CustomerOrder {
  @ApiProperty({
    type: 'string',
    format: 'guid',
    example: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  })
  @IsString()
  @IsNotEmpty()
  customerGuid: string;

  @ApiProperty({
    type: 'number',
    format: 'money',
    multipleOf: 0.01,
    example: '1500.55',
  })
  @IsNumber()
  @IsNotEmpty()
  orderAmount: number;

  @ApiProperty({
    type: Address,
  })
  customerAddress: Address;
}

export class OrderFraudCheck {
  @ApiProperty({
    type: 'string',
    format: 'guid',
    example: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  })
  @IsString()
  @IsNotEmpty()
  orderFraudCheckId: string;

  @ApiProperty({
    type: 'string',
    format: 'guid',
    example: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  })
  @IsString()
  @IsNotEmpty()
  customerGuid: string;

  @ApiProperty({
    type: 'string',
    format: 'alphanumeric',
    example: 'ABC123',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    type: 'number',
    format: 'money',
    multipleOf: 0.01,
    example: '1500.55',
  })
  @IsNumber()
  @IsNotEmpty()
  orderAmount: number;

  @ApiProperty({
    type: 'string',
    enum: FraudCheckStatus,
    description: 'The result of Fraud Check',
  })
  @IsEnum(FraudCheckStatus)
  @IsNotEmpty()
  fraudCheckStatus: FraudCheckStatus;
}
