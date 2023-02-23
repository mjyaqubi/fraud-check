import { Provider } from '@nestjs/common';

export const PROMISE_PROVIDER = 'PROMISE_PROVIDER';

export type PromiseProvider = {
  resolver: <T = any, U = any>(
    promise: Promise<T>,
  ) => Promise<[T | null, U | any]>;
};

export const promiseProvider: Provider = {
  useFactory: (): PromiseProvider => {
    return {
      resolver: <T = any, U = any>(
        promise: Promise<T>,
      ): Promise<[T | null, U | any]> => {
        return new Promise((resolve) => {
          promise
            .then((response: any) => {
              resolve([response, null]);
            })
            .catch((error) => {
              resolve([null, error]);
            });
        });
      },
    };
  },
  provide: PROMISE_PROVIDER,
};
