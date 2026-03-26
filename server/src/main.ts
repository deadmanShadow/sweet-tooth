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
