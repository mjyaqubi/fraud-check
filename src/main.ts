import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/service';
import { ConfigService } from './common/config/service';
import {
  SERVICE_CONFIGS,
  SERVICE_URL_CONFIGS,
  SERVER_CONFIGS,
} from './common/config/const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter();
  const loggerService = app.get(LoggerService);
  const configService = app.get(ConfigService);

  const name = <string>configService.get(SERVICE_CONFIGS.NAME);
  const desc = <string>configService.get(SERVICE_CONFIGS.DESCRIPTION);
  const version = <string>configService.get(SERVICE_CONFIGS.VERSION);
  const baseUrl = <string>configService.get(SERVICE_URL_CONFIGS.BASE);
  const docsUrl = <string>configService.get(SERVICE_URL_CONFIGS.DOCS);
  const host = <string>configService.get(SERVER_CONFIGS.HOST);
  const port = <number>configService.get(SERVER_CONFIGS.PORT, undefined);

  app.enableCors();
  app.setGlobalPrefix(baseUrl);
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle(name)
    .setDescription(`${desc} | [swagger.json](swagger.json)`)
    .setVersion(version)
    .addServer(`http://${host}${port != undefined ? `:${port}` : ''}`)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  writeFileSync(
    `${process.cwd()}/swagger.json`,
    JSON.stringify(document, null, 2),
    { encoding: 'utf8' },
  );
  server.get(`${docsUrl}/swagger.json`, (_req, res) => {
    res.json(document);
  });
  SwaggerModule.setup(docsUrl, app, document, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });

  try {
    await app.listen(port);
    loggerService.log(
      `API endpoints are ready on port (${port})`,
      'NestApplication',
    );
  } catch (error) {
    loggerService.error('Unable to lunch the API', error, 'NestApplication');
  }
}
bootstrap();
