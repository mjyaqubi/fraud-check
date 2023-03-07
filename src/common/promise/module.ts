import { Module } from '@nestjs/common';
import { promiseProvider } from './provider';
import { PromiseService } from './services';

@Module({
  providers: [promiseProvider, PromiseService],
  exports: [promiseProvider, PromiseService],
})
export class PromiseModule {}
