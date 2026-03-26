import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validate';
import { HealthModule } from './modules/health/health.module';
import { EchoModule } from './modules/echo/echo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    HealthModule,
    EchoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
