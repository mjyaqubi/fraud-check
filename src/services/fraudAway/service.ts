import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { ConfigService } from '../../common/config/service';
import { LoggerService } from '../../common/logger/service';
import { PromiseService } from '../../common/promise/services';
import { FraudAwayRequest, FraudAwayResponse } from './dto';

@Injectable()
export class FraudAwayService {
  private path = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
    private readonly promiseService: PromiseService,
  ) {
    this.path = <string>(
      this.configService.get(SERVICES_CONFIGS.FRAUD_AWAY_PATH)
    );
  }

  async performFraudCheck(
    request: FraudAwayRequest,
  ): Promise<FraudAwayResponse> {
    const [result, error] = await this.promiseService.resolver(
      firstValueFrom(
        this.httpService.post<FraudAwayResponse>(this.path, request).pipe(
          catchError((error: AxiosError) => {
            throw error.message;
          }),
        ),
      ),
    );

    if (error) {
      this.loggerService.error(
        'Something went wrong while fraud check by Fraud Away API',
        error,
        'FraudAwayService',
      );
      throw error;
    }

    return result.data;
  }
}
