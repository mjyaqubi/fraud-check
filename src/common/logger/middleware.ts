import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction, response } from 'express';
import * as httpContext from 'express-http-context';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  setRequestTimestamp(req: Request): void {
    req['timestamp'] = Date.now();
  }

  setRequestId(req: Request): void {
    const requestId = uuid();
    req['requestId'] = requestId;
    httpContext.set('requestId', requestId);
  }

  tryParseJSON(payload: string): any {
    try {
      const jsonObj = JSON.parse(payload);
      return jsonObj;
    } catch (e) {
      return payload;
    }
  }

  getRequestInfo(req: Request) {
    return {
      timestamp: new Date().toISOString(),
      requestId: req['requestId'],
      level: 'debug',
      clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      method: req.method,
      originalUri: req.originalUrl,
      uri: req.url,
      referer: req.headers.referer || '',
      userAgent: req.headers['user-agent'],
      message: `HTTP Request - ${req['requestId']}`,
      request: {
        body: this.tryParseJSON({ ...req.body }),
        headers: req.headers,
      },
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.setRequestTimestamp(req);
    this.setRequestId(req);

    const logPayload = this.getRequestInfo(req);
    this.logger.log(JSON.stringify(logPayload), 'HttpRequest');

    const rawResponse = res.write;
    const rawResponseEnd = res.end;
    const chunks: any[] = [];
    res.write = (...restArgs: any[]) => {
      chunks.push(Buffer.from(restArgs[0]));
      return rawResponse.apply(res, restArgs);
    };

    res.end = (...restArgs: any[]) => {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const body = Buffer.concat(chunks).toString('utf8');

      logPayload['response'] = {
        body: this.tryParseJSON(body),
        headers: res.getHeaders(),
      };
      this.logger.log(JSON.stringify(logPayload), 'HttpResponse');
      rawResponseEnd.apply(res, restArgs);
      return response;
    };

    next();
  }
}
