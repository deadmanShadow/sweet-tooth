import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validate';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CakesModule } from './modules/cakes/cakes.module';
import { CustomRequestsModule } from './modules/custom-requests/custom-requests.module';
import { EchoModule } from './modules/echo/echo.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    CustomRequestsModule,
    HealthModule,
    EchoModule,
    AuthModule,
    CakesModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
