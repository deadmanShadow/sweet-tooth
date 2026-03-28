import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CakesModule } from '../cakes/cakes.module';
import { OrdersModule } from '../orders/orders.module';
import { CustomRequestsController } from './custom-requests.controller';
import { CustomRequestsService } from './custom-requests.service';

@Module({
  imports: [DatabaseModule, CakesModule, OrdersModule],
  controllers: [CustomRequestsController],
  providers: [CustomRequestsService],
})
export class CustomRequestsModule {}
