import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SimpleFraudResult } from './enum';

export class SimpleFraudRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsNotEmpty()
  postCode: string;
}

export class SimpleFraudResponse {
  @IsEnum(SimpleFraudResult)
  @IsNotEmpty()
  result: SimpleFraudResult;
}
