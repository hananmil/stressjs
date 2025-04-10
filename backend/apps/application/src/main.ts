import * as os from 'os';
import { Logger, ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { swaggerSetup } from './app/swagger';
import * as express from 'express';
import { AllExceptionsFilter } from './globalErrorHandler';
import { config } from 'dotenv';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new AllExceptionsFilter(new Logger('GlobalErrorHandler')),
  );
  app.enableShutdownHooks([ShutdownSignal.SIGINT]);

  swaggerSetup(app);
  app.enableCors({
    allowedHeaders: '*',
    exposedHeaders: '*',
    origin: '*',
    credentials: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200,
  });
  app.use(express.text());
  await app.listen(3000);
  Logger.log(
    `🚀 Application is running on port 3000... ` + os.platform(),
    'Bootstrap',
  );
}
config();
thisServer.type = 'api';
bootstrap();
