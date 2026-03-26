import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validate';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { EchoModule } from './modules/echo/echo.module';
import { AuthModule } from './modules/auth/auth.module';
import { CakesModule } from './modules/cakes/cakes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    HealthModule,
    EchoModule,
    AuthModule,
    CakesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
