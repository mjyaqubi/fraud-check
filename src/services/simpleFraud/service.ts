import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PromiseService } from '../../common/promise/services';
import { SERVICES_CONFIGS } from '../../common/config/const';
import { ConfigService } from '../../common/config/service';
import { SimpleFraudRequest, SimpleFraudResponse } from './dto';
import { AxiosError } from 'axios';
import { SimpleFraudResult } from './enum';

@Injectable()
export class SimpleFraudService {
  private path = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly promiseService: PromiseService,
  ) {
    this.path = <string>(
      this.configService.get(SERVICES_CONFIGS.SIMPLE_FRAUD_PATH)
    );
  }

  generateXmlRequest(request: SimpleFraudRequest): string {
    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      `<RequestBody><name>${request.name}</name>` +
      `<addressLine1>${request.addressLine1}</addressLine1>` +
      `<postCode>${request.postCode}</postCode></RequestBody>`
    );
  }

  extractResultFromXml(response: string): SimpleFraudResult {
    if (!response || response === '') {
      throw 'response is empty!';
    }

    const startIndex = response.indexOf('<result>');
    if (startIndex === -1) {
      throw 'result is not exist in the response';
    }

    const result = response.slice(startIndex + 8, 4);
    if (result === SimpleFraudResult.PASSED) {
      return SimpleFraudResult.PASSED;
    } else if (result === SimpleFraudResult.FAILED) {
      return SimpleFraudResult.FAILED;
    } else {
      throw 'unexpected result';
    }
  }

  async performFraudCheck(
    request: SimpleFraudRequest,
  ): Promise<SimpleFraudResponse> {
    const xmlRequest = this.generateXmlRequest(request);

    const [response, error] = await this.promiseService.resolver(
      firstValueFrom(
        this.httpService.post<string>(this.path, xmlRequest).pipe(
          catchError((error: AxiosError) => {
            throw error.message;
          }),
        ),
      ),
    );

    if (error) {
      throw error;
    }

    const result = this.extractResultFromXml(response.data);
    return <SimpleFraudResponse>{
      result,
    };
  }
}
