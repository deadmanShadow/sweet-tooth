import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UsersModule } from '../users/users.module';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService, WhatsAppService],
  exports: [OrdersService],
})
export class OrdersModule {}
