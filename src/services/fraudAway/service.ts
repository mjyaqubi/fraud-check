import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PromiseService } from '../../common/promise/services';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { ConfigService } from '../../common/config/service';
import { FraudAwayRequest, FraudAwayResponse } from './dto';
import { AxiosError } from 'axios';

@Injectable()
export class FraudAwayService {
  private path = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
      throw error;
    }

    return result.data;
  }
}
