import { Inject, Injectable } from '@nestjs/common';
import { PromiseProvider, PROMISE_PROVIDER } from './provider';

@Injectable()
export class PromiseService {
  public constructor(
    @Inject(PROMISE_PROVIDER) private readonly promiseProvider: PromiseProvider,
  ) {}

  public resolver<T = any, U = any>(
    promise: Promise<T>,
  ): Promise<[T | null, U | any]> {
    return this.promiseProvider.resolver(promise);
  }
}
