import { IsNotEmpty, IsString } from 'class-validator';

export class PersonalAddress {
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsNotEmpty()
  town: string;

  @IsString()
  @IsNotEmpty()
  county: string;

  @IsString()
  @IsNotEmpty()
  postCode: string;
}

export class FraudAwayRequest {
  @IsString()
  @IsNotEmpty()
  personFullName: string;

  personAddress: PersonalAddress;
}

export class FraudAwayResponse {
  fraudRiskScore: number;
}
