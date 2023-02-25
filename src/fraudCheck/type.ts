import { FraudCheckStatus } from './enum';

export type Address = {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
};

export type CustomerOrderRequest = {
  customerGuid: string;
  orderAmount: number;
  customerAddress: Address;
};

export type OrderFraudCheckRequest = {
  orderFraudCheckId: string;
  customerGuid: string;
  orderId: string;
  orderAmount: number;
  fraudCheckStatus: FraudCheckStatus;
};
