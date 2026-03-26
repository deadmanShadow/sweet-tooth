import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.enableShutdownHooks();

  app.use(helmet());

  const corsOriginRaw = config.get<string>('corsOrigin', '*');
  const frontendUrl = config.get<string>('frontendUrl');

  let corsOrigins: string | string[] | boolean;

  if (corsOriginRaw === '*') {
    corsOrigins = frontendUrl ? [frontendUrl.replace(/\/$/, '')] : true;
  } else {
    corsOrigins = corsOriginRaw
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean);

    if (frontendUrl) {
      const cleanFrontendUrl = frontendUrl.replace(/\/$/, '');
      if (!corsOrigins.includes(cleanFrontendUrl)) {
        corsOrigins.push(cleanFrontendUrl);
      }
    }
  }
  app.enableCors({
    origin: process.env.NEXT_FRONTEND_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
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
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cake API')
    .setDescription('Cake eCommerce API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('port', 5000);
  await app.listen(port);
}
void bootstrap();
