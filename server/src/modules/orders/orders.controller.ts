import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  CurrentUser as CurrentUserDecorator,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orders.create(user.id, dto);
  }

  @Get('my')
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAllMy(@CurrentUserDecorator() user: CurrentUser) {
    return this.orders.findAllForUser(user.id);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.orders.findAllAdmin();
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @CurrentUserDecorator() user: CurrentUser) {
    return this.orders.findOne(id).then((order) => {
      if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to view this order',
        );
      }
      return order;
    });
  }
}
