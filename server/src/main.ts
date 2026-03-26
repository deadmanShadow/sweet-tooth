import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  app.use(helmet());

  const corsOriginRaw = config.get<string>('corsOrigin', '*');
  const isWildcard = corsOriginRaw === '*';
  const corsOrigins = isWildcard
    ? undefined
    : corsOriginRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  app.enableCors({
    origin: isWildcard ? true : corsOrigins,
    credentials: !isWildcard,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve uploaded cake images
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = config.get<number>('port', 3000);
  await app.listen(port);
}
bootstrap();
