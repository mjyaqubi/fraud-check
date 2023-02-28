export const customerOrderId = 'ABC456';

export const customerOrderRequest = {
  customerGuid: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  orderAmount: 1500.55,
  customerAddress: {
    firstName: 'John',
    lastName: 'Doe',
    line1: '10 High Street',
    city: 'London',
    region: 'Greater London',
    postalCode: 'W1T 3HE',
  },
};

export const orderFraudCheckId = 'e9e85a67-4189-4096-9fdd-226d9d90e023';

export const orderFraudCheckResult = {
  orderFraudCheckId: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  customerGuid: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  orderId: 'ABC123',
  orderAmount: 1500.55,
  fraudCheckStatus: 'Passed',
};

export const orderFraudCheckResultWithoutId = {
  customerGuid: 'e9e85a67-4189-4096-9fdd-226d9d90e023',
  orderId: 'ABC456',
  orderAmount: 1500.55,
  fraudCheckStatus: 'Passed',
};
